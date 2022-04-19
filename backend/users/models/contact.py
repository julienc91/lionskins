import smtplib
import uuid
from email.message import EmailMessage

from django.conf import settings
from django.db import models
from django.utils import timezone


class Contact(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    name = models.CharField(max_length=255, blank=True)
    email = models.EmailField(max_length=255, blank=True)
    message = models.TextField()
    user = models.ForeignKey("users.User", on_delete=models.SET_NULL, null=True)
    creation_date = models.DateTimeField(default=timezone.now)

    def send(self):
        msg = EmailMessage()
        msg.set_content(f'From: "{self.name}"<{self.email}>\n\n{self.message}')
        msg["Subject"] = "[LionSkins] Contact"
        msg["From"] = settings.CONTACT_FROM
        msg["To"] = settings.CONTACT_TO

        with smtplib.SMTP(settings.SMTP_HOSTNAME, settings.SMTP_PORT) as smtp:
            smtp.starttls()
            smtp.login(settings.SMTP_LOGIN, settings.SMTP_PASSWORD)
            smtp.send_message(msg)
