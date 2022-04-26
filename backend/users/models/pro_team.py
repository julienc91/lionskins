import uuid

from django.db import models
from django.utils import timezone


class ProTeam(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    name = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True)
    rank = models.PositiveSmallIntegerField(null=True)
    liquipedia_id = models.CharField(max_length=128, null=True)
    creation_date = models.DateTimeField(default=timezone.now)
    update_date = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"<ProTeam: {self.name}>"
