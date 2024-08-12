# Generated by Django 4.2.14 on 2024-08-12 12:04

import django.contrib.postgres.indexes
import django.db.models.constraints
import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models

import posthog.models.utils
import posthog.warehouse.models.modeling


class Migration(migrations.Migration):
    dependencies = [
        ("posthog", "0460_alertconfiguration_threshold_alertsubscription_and_more"),
    ]

    operations = [
        migrations.RunSQL("CREATE EXTENSION ltree;"),
        migrations.CreateModel(
            name="DataWarehouseModelPath",
            fields=[
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True, null=True)),
                (
                    "id",
                    models.UUIDField(
                        default=posthog.models.utils.UUIDT, editable=False, primary_key=True, serialize=False
                    ),
                ),
                ("path", posthog.warehouse.models.modeling.LabelTreeField()),
                (
                    "created_by",
                    models.ForeignKey(
                        blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to=settings.AUTH_USER_MODEL
                    ),
                ),
                (
                    "saved_query",
                    models.ForeignKey(
                        default=None,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        to="posthog.datawarehousesavedquery",
                    ),
                ),
                (
                    "table",
                    models.ForeignKey(
                        default=None,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        to="posthog.datawarehousetable",
                    ),
                ),
                ("team", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to="posthog.team")),
            ],
            options={
                "indexes": [
                    models.Index(fields=["team_id", "path"], name="team_id_path"),
                    models.Index(fields=["team_id", "saved_query_id"], name="team_id_saved_query_id"),
                    django.contrib.postgres.indexes.GistIndex(models.F("path"), name="model_path_path"),
                ],
            },
        ),
        migrations.AddConstraint(
            model_name="datawarehousemodelpath",
            constraint=models.UniqueConstraint(
                deferrable=django.db.models.constraints.Deferrable["IMMEDIATE"],
                fields=("team_id", "path"),
                name="unique_team_id_path",
            ),
        ),
    ]
