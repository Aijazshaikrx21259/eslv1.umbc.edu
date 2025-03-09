from django.db import models

# Create your models here.
class NutritionFile(models.Model):
    file = models.FileField(upload_to="nutrition_files/")
    uploaded_at = models.DateTimeField(auto_now_add=True)   

class Device(models.Model):
    device_make = models.CharField(max_length=255)
    device_model = models.CharField(max_length=255)
    os_name = models.CharField(max_length=255)
    os_version = models.CharField(max_length=50)
    os_release_date = models.DateField()

    def __str__(self):
        return f"{self.device_make} {self.device_model} ({self.os_name} {self.os_version})"

# Apps Table
class App(models.Model):
    app_name = models.CharField(max_length=255)
    app_version = models.CharField(max_length=50)
    developer = models.CharField(max_length=255)
    category = models.CharField(max_length=100)
    review_score = models.FloatField()
    ranking_in_category = models.IntegerField()
    installation_size = models.CharField(max_length=50)
    recommended_age_range = models.CharField(max_length=50, default="Not Available")

    def __str__(self):
        return f"{self.app_name} ({self.app_version}) - {self.developer}"

# Usage Stats Table
class UsageStats(models.Model):
    device = models.ForeignKey(Device, on_delete=models.CASCADE)  # Link to Device table
    timestamp = models.DateTimeField()
    battery = models.IntegerField()
    cpu = models.IntegerField()
    threads = models.IntegerField()
    memory = models.CharField(max_length=50)
    storage_available = models.CharField(max_length=50)

    # Embedded Document for Network & I/O
    network_type = models.CharField(max_length=50)
    io_received = models.CharField(max_length=50)
    io_sent = models.CharField(max_length=50)

    # Array of Strings for Access Information
    access_information = models.JSONField(default=list)

    def __str__(self):
        return f"Usage Stats for {self.device} at {self.timestamp}"

# Data Permissions Table
class DataPermissions(models.Model):
    app = models.ForeignKey(App, on_delete=models.CASCADE)  # Link to App table

    # Embedded Documents
    data_collected_linked_to_you = models.JSONField(default=list)  # Array of Strings
    data_collected_not_linked_to_you = models.JSONField(default=list)

    permissions_asked_for = models.JSONField(default=list)  # Array of Strings
    permissions_granted = models.JSONField(default=list)

    def __str__(self):
        return f"Permissions for {self.app.app_name} ({self.app.app_version})"
