# Generated by Django 4.2.14 on 2024-08-12 17:24

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("posthog", "0460_alertconfiguration_threshold_alertsubscription_and_more"),
    ]

    operations = [
        migrations.AddField(
            model_name="action",
            name="pinned_at",
            field=models.DateTimeField(blank=True, default=None, null=True),
        ),
    ]
