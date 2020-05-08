# -*- coding: utf-8 -*-

import os
import smtplib
from datetime import datetime
from email.message import EmailMessage

from ..init import db
from .model_mixin import ModelMixin
from .users import User


class Contact(ModelMixin, db.Document):

    name = db.StringField()
    email = db.EmailField()
    message = db.StringField(required=True)
    user = db.ReferenceField(User)

    creation_date = db.DateTimeField(required=True, default=datetime.now)

    meta = {"indexes": ["creation_date"]}

    def send(self):
        msg = EmailMessage()
        msg.set_content(f'From: "{self.name}"<{self.email}>\n\n{self.message}')
        msg["Subject"] = f"[LionSkins] Contact"
        msg["From"] = os.environ["CONTACT_FROM"]
        msg["To"] = os.environ["CONTACT_TO"]

        with smtplib.SMTP(os.environ["SMTP_HOSTNAME"], os.environ["SMTP_PORT"]) as smtp:
            smtp.starttls()
            smtp.login(os.environ["SMTP_LOGIN"], os.environ["SMTP_PASSWORD"])
            smtp.send_message(msg)
