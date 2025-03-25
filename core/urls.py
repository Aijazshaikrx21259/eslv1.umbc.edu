from django.urls import path
from . import views
from .views import get_digital_nutrition, upload_nutrition_file

urlpatterns = [
    path("upload/", upload_nutrition_file, name="upload_nutrition_file"),  # File upload API
    path("device/<int:device_id>/nutrition/<int:app_id>/", get_digital_nutrition, name="get_digital_nutrition"),  # Corrected API URL
    path('upload-policy/', views.upload_policy_document, name='upload_policy_document'),
    path("policy/<int:document_id>/", views.get_policy_document, name="get_policy_document")
]
