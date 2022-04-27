# Generated by Django 4.0.4 on 2022-04-27 19:09

import django.db.models.deletion
import django.utils.timezone
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("csgo", "0003_alter_skin_description"),
        ("users", "0003_proteam_alter_redirect_provider_proplayer"),
    ]

    operations = [
        migrations.CreateModel(
            name="Inventory",
            fields=[
                (
                    "user",
                    models.OneToOneField(
                        on_delete=django.db.models.deletion.CASCADE,
                        primary_key=True,
                        serialize=False,
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
                (
                    "creation_date",
                    models.DateTimeField(default=django.utils.timezone.now),
                ),
                (
                    "update_date",
                    models.DateTimeField(default=django.utils.timezone.now),
                ),
                ("in_error", models.BooleanField(default=False)),
            ],
        ),
        migrations.CreateModel(
            name="SkinInventory",
            fields=[
                (
                    "id",
                    models.AutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("quantity", models.PositiveSmallIntegerField()),
                (
                    "inventory",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        to="users.inventory",
                    ),
                ),
                (
                    "skin",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE, to="csgo.skin"
                    ),
                ),
            ],
        ),
        migrations.AddConstraint(
            model_name="skininventory",
            constraint=models.UniqueConstraint(
                fields=("inventory", "skin"), name="unique_skin_inventory"
            ),
        ),
    ]
