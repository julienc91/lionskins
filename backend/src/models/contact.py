# -*- coding: utf-8 -*-

import os
import uuid
from datetime import datetime

import requests
from flask import request

from ..init import sqlalchemy as db
from .model_mixin import ModelMixin


class Contact(ModelMixin, db.Model):

    __tablename__ = 'contact'

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))

    name = db.Column(db.String(127))
    email = db.Column(db.String(127))
    message = db.Column(db.Text)

    creation_date = db.Column(db.DateTime, default=datetime.now, nullable=False, index=True)

    @staticmethod
    def check_captcha(response):
        res = requests.post(
            'https://www.google.com/recaptcha/api/siteverify',
            {
                'secret': os.environ['RECAPTCHA_SECRET'],
                'response': response,
                'remoteip': request.remote_addr,
            }
        )
        return res.json().get('success')
