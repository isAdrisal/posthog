# Generated by Django 4.2.11 on 2024-06-05 17:12

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("posthog", "0422_proxyrecord_message"),
    ]

    operations = [
        migrations.AlterField(
            model_name="externaldatasource",
            name="source_type",
            field=models.CharField(
                choices=[
                    ("Stripe", "Stripe"),
                    ("Hubspot", "Hubspot"),
                    ("Postgres", "Postgres"),
                    ("Zendesk", "Zendesk"),
                    ("Snowflake", "Snowflake"),
                ],
                max_length=128,
            ),
        ),
    ]
