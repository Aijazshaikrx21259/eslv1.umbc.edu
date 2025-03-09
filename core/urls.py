from django.urls import path
from .views import get_digital_nutrition, upload_nutrition_file

urlpatterns = [
    path("upload/", upload_nutrition_file, name="upload_nutrition_file"),  # File upload API
    path("<str:app_name>/", get_digital_nutrition, name="get_digital_nutrition"),  # App details API
]
