import uuid

from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    steam_id = models.CharField(max_length=64, unique=True)
    username = models.CharField(max_length=150)

    USERNAME_FIELD = "steam_id"
