# Generated by Django 3.0.11 on 2020-12-10 22:18

from django.db import migrations, models


def add_plugin_types(apps, schema_editor):
    Plugin = apps.get_model("posthog", "Plugin")
    for plugin in Plugin.objects.filter(plugin_type__isnull=True):
        plugin.plugin_type = "local" if plugin.url and plugin.url.startswith("file:") else "custom"
        plugin.save()


def backwards(apps, schema_editor):
    pass


class Migration(migrations.Migration):
    dependencies = [
        ("posthog", "0106_dashboard_item_type_to_display"),
    ]

    operations = [
        migrations.AddField(
            model_name="plugin",
            name="plugin_type",
            field=models.CharField(
                blank=True,
                choices=[
                    ("local", "local"),
                    ("custom", "custom"),
                    ("repository", "repository"),
                    ("source", "source"),
                ],
                default=None,
                max_length=200,
                null=True,
            ),
        ),
        migrations.AddField(
            model_name="plugin",
            name="source",
            field=models.TextField(blank=True, null=True),
        ),
        migrations.RunPython(add_plugin_types, backwards, elidable=True),
    ]
