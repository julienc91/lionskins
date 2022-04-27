from django.db import models
from django.utils import timezone


class Inventory(models.Model):
    user = models.OneToOneField(
        "users.User", on_delete=models.CASCADE, primary_key=True
    )
    creation_date = models.DateTimeField(default=timezone.now)
    update_date = models.DateTimeField(default=timezone.now)
    in_error = models.BooleanField(default=False)


class SkinInventory(models.Model):
    inventory = models.ForeignKey("users.Inventory", on_delete=models.CASCADE)
    skin = models.ForeignKey("csgo.Skin", on_delete=models.CASCADE)
    quantity = models.PositiveSmallIntegerField()

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["inventory", "skin"], name="unique_skin_inventory"
            )
        ]
