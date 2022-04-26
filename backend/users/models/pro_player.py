import uuid

from django.db import models
from django.utils import timezone


class ProPlayer(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    user = models.OneToOneField("users.User", on_delete=models.CASCADE)
    nickname = models.CharField(max_length=128)
    role = models.CharField(max_length=64)
    slug = models.SlugField(max_length=128)
    country_code = models.CharField(max_length=2, null=True)
    team = models.ForeignKey(
        "users.ProTeam", null=True, on_delete=models.SET_NULL, related_name="players"
    )
    creation_date = models.DateTimeField(default=timezone.now)
    update_date = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"<ProPlayer: {self.nickname} ({self.country_code})>"
