import uuid

from django.db import models
from django.utils import timezone

from lionskins.models.enums import Providers


class Redirect(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    skin = models.ForeignKey("csgo.Skin", on_delete=models.CASCADE)
    provider = models.CharField(max_length=32, choices=Providers.choices)
    tracker = models.CharField(max_length=64)
    creation_date = models.DateTimeField(default=timezone.now)
