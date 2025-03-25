import re
import json
import nltk

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from datetime import datetime
from .models import Device, App, UsageStats, DataPermissions
from .models import PolicyDocument
from django.shortcuts import get_object_or_404
from .utils import extract_text_from_pdf, extract_text_from_docx, generate_summary


def parse_nutrition_data(file_content):
    """
    Parses the uploaded text file and extracts structured data.
    Handles multi-line values and lists properly.
    """
    parsed_entry = {}
    current_key = None  # Tracks multi-line keys

    lines = file_content.split("\n")

    for line in lines:
        line = line.strip()

        # Ignore empty lines
        if not line:
            current_key = None
            continue

        # Handle multi-line list values
        if current_key:
            parsed_entry[current_key].append(line.strip())

        # Handle normal key-value pairs
        elif ":" in line:
            key, value = map(str.strip, line.split(":", 1))

            if not value:  # If value is empty, it's a multi-line field
                current_key = key
                parsed_entry[key] = []
            else:
                # Convert bracketed lists into Python lists
                if value.startswith("[") and value.endswith("]"):
                    parsed_entry[key] = [item.strip() for item in value[1:-1].split(",")]
                else:
                    parsed_entry[key] = value

    return parsed_entry


@csrf_exempt
def upload_nutrition_file(request):
    if request.method == "POST" and request.FILES.get("file"):
        uploaded_file = request.FILES["file"]

        # Save file temporarily
        file_path = default_storage.save(f"nutrition_files/{uploaded_file.name}", ContentFile(uploaded_file.read()))

        # Read and parse the file
        file_content = default_storage.open(file_path).read().decode("utf-8")
        parsed_entry = parse_nutrition_data(file_content)

        # Convert date fields
        date_fields = ["Date", "OS Release Date", "Version Release Date"]
        for field in date_fields:
            if field in parsed_entry and parsed_entry[field]:
                try:
                    parsed_entry[field] = datetime.strptime(parsed_entry[field], "%Y-%m-%d").date()
                except ValueError:
                    parsed_entry[field] = None

        # Convert numeric fields
        float_fields = ["Battery (%)", "CPU", "Threads"]
        for field in float_fields:
            if field in parsed_entry and parsed_entry[field]:
                try:
                    parsed_entry[field] = float(re.sub(r"[^\d.]", "", parsed_entry[field]))
                except ValueError:
                    parsed_entry[field] = None

        # ✅ Step 1: Insert or Retrieve Device Information
        device, _ = Device.objects.get_or_create(
            device_make=parsed_entry.get("Device Make", ""),
            device_model=parsed_entry.get("Device Model", ""),
            os_name=parsed_entry.get("OS Name", ""),
            os_version=parsed_entry.get("OS Version", ""),
            os_release_date=parsed_entry.get("OS Release Date"),
        )

        # ✅ Step 2: Insert or Retrieve App Information

# Extract numeric value from ranking (e.g., "#2 in Health & Fitness" → 2)
        ranking_value = parsed_entry.get("Ranking in Category", "")
        ranking_numeric = int(re.search(r"\d+", ranking_value).group()) if re.search(r"\d+", ranking_value) else None

        review_value = parsed_entry.get("Review Score", "")
        review_numeric = float(re.search(r"[\d.]+", review_value).group()) if re.search(r"[\d.]+", review_value) else None


        app, _ = App.objects.get_or_create( 
            app_name=parsed_entry.get("App Name", ""),
            app_version=parsed_entry.get("App Version", ""),
            developer=parsed_entry.get("Developer", ""),
            category=parsed_entry.get("App Category", ""),
            review_score=review_numeric,  # Store only the number
            ranking_in_category=ranking_numeric,  # Store only the number
            installation_size=parsed_entry.get("Installation Size", ""),
        )

        # ✅ Step 3: Insert Usage Stats (Preventing Duplicates)
        UsageStats.objects.update_or_create(
            device=device,
            timestamp=datetime.now(),  # Use the current timestamp
            defaults={
                "battery": parsed_entry.get("Battery (%)"),
                "cpu": parsed_entry.get("CPU"),
                "threads": parsed_entry.get("Threads"),
                "memory": parsed_entry.get("Memory", ""),
                "storage_available": parsed_entry.get("Storage", ""),
                "network_type": parsed_entry.get("Network Types", ""),
                "io_received": parsed_entry.get("I/O", "").split("/")[0].strip() if "I/O" in parsed_entry else "",
                "io_sent": parsed_entry.get("I/O", "").split("/")[1].strip() if "I/O" in parsed_entry else "",
                "access_information": parsed_entry.get("Access Information", []),
            }
        )

        # ✅ Step 4: Insert Data Permissions (Preventing Duplicates)
        DataPermissions.objects.update_or_create(
            app=app,
            defaults={
                "data_collected_linked_to_you": parsed_entry.get("Data Collected (Linked to You)", []),
                "data_collected_not_linked_to_you": parsed_entry.get("Data Collected (Not Linked to You)", []),
                "permissions_asked_for": parsed_entry.get("Permissions Asked For", []),
                "permissions_granted": parsed_entry.get("Permissions Granted", []),
            }
        )

        return JsonResponse({"message": "Data successfully stored without duplicates!"}, status=201)

    return JsonResponse({"error": "No file uploaded"}, status=400)

@csrf_exempt
def get_digital_nutrition(request, device_id, app_id):
    """
    Retrieve the digital nutrition facts for a given app running on a specific device.
    """
    try:
        # Get the Device
        device = Device.objects.get(id=device_id)

        # Get the App
        app = App.objects.get(id=app_id)

        # Get Latest Usage Stats for the Specific Device
        usage_stats = UsageStats.objects.filter(device=device).order_by("-timestamp").first()

        # Get Permissions & Privacy Info for the App
        data_permissions = DataPermissions.objects.filter(app=app).first()

        # Calculate Battery Impact Per Hour
        battery_impact = f"{round(usage_stats.battery / 10, 2)}% per hour" if usage_stats else "Unknown"

        # Determine Internet Requirement
        internet_requirement = "Yes" if usage_stats and usage_stats.network_type else "No"

        # Calculate Interruptions
        notifications = data_permissions.permissions_asked_for.count("Notifications") if data_permissions else 0
        popups = 2  # Placeholder value
        emails_sms = data_permissions.permissions_asked_for.count("Email") if data_permissions else 0

        # Prepare JSON Response
        response_data = {
            "Device Name": f"{device.device_make} {device.device_model}",
            "App Name": app.app_name,
            "Version": app.app_version,
            "Evaluated On": datetime.now().strftime("%Y-%m-%d"),
            "For Ages": app.recommended_age_range,
            "Average Daily Interruptions": notifications + popups + emails_sms,
            "Notifications": notifications,
            "Popups": popups,
            "Emails/SMS": emails_sms,
            "Privacy": {
                "Access To": {
                    "Camera": "Optional" if "Camera" in data_permissions.permissions_asked_for else "Not Applicable",
                    "Microphone": "Optional" if "Microphone" in data_permissions.permissions_asked_for else "Not Applicable",
                    "Photos": "Optional" if "Photos" in data_permissions.permissions_asked_for else "Not Applicable",
                    "Location": "Mandatory" if "Location" in data_permissions.permissions_asked_for else "Not Applicable",
                    "Contacts": "Not Applicable" if "Contacts" not in data_permissions.permissions_asked_for else "Applicable",
                    "Storage": "Optional" if "Storage" in data_permissions.permissions_asked_for else "Not Applicable",
                }
            },
            "User Rights": {
                "Ads Opt-Out": "Allowed",
                "Account Deletion": "Allowed",
                "User Data Export": "Allowed",
            },
            "Monetization": {
                "Usage Cost": "Free (with in-app purchases)" if "Free" in app.installation_size else "Paid",
                "Includes Recurring Payments": "No",
                "Includes In-App Purchases": "Yes" if "in-app purchases" in app.installation_size.lower() else "No"
            },
            "Device Resources": {
                "Battery Impact": battery_impact,
                "Storage Footprint": usage_stats.storage_available if usage_stats else "Unknown",
                "Internet Requirement": internet_requirement
            }
        }

        return JsonResponse(response_data, status=200, json_dumps_params={'indent': 4})

    except Device.DoesNotExist:
        return JsonResponse({"error": "Device not found"}, status=404)
    except App.DoesNotExist:
        return JsonResponse({"error": "App not found"}, status=404)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)



@csrf_exempt
def upload_policy_document(request):
    if request.method == "POST":
        document_type = request.POST.get("document_type")  # 'tos' or 'privacy'
        uploaded_file = request.FILES.get("file")

        if not uploaded_file or not document_type:
            return JsonResponse({"error": "Missing file or document_type"}, status=400)

        try:
            if uploaded_file.name.endswith(".pdf"):
                text = extract_text_from_pdf(uploaded_file)
            elif uploaded_file.name.endswith(".docx"):
                text = extract_text_from_docx(uploaded_file)
            else:
                return JsonResponse({"error": "Unsupported file type"}, status=400)
        except Exception as e:
            return JsonResponse({"error": f"Failed to extract text: {str(e)}"}, status=500)
        nltk.data.path.append("C:/Users/abeyr/AppData/Roaming/nltk_data")
        summary = generate_summary(text)
        # Save to DB
        document = PolicyDocument.objects.create(
            document_type=document_type,
            title=uploaded_file.name,
            upload=uploaded_file,
            extracted_text=text,
            summary=summary
        )

        return JsonResponse({"message": "Document uploaded and text extracted successfully", "document_id": document.id}, status=201)

    return JsonResponse({"error": "Only POST method allowed"}, status=405)



@csrf_exempt
def get_policy_document(request, document_id):
    if request.method == "GET":
        document = get_object_or_404(PolicyDocument, id=document_id)
        response = {
            "id": document.id,
            "type": document.get_document_type_display(),
            "title": document.title,
            "uploaded_at": document.uploaded_at.strftime("%Y-%m-%d %H:%M:%S"),
            "file_path": document.upload.url,
            "summary": document.summary
        }
        return JsonResponse(response, status=200, json_dumps_params={'indent': 4})
    return JsonResponse({"error": "Only GET method allowed"}, status=405)