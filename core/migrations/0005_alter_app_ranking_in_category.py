# Generated by Django 5.1.7 on 2025-03-11 15:54

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0004_alter_app_recommended_age_range'),
    ]

    operations = [
        migrations.AlterField(
            model_name='app',
            name='ranking_in_category',
            field=models.IntegerField(blank=True, null=True),
        ),
    ]
