# -*- coding: utf-8 -*-

import os
from datetime import datetime

import requests
from flask import request

from ..init import db
from .model_mixin import ModelMixin


class Contact(ModelMixin, db.Document):

    name = db.StringField()
    email = db.EmailField()
    message = db.StringField(required=True)

    creation_date = db.DateTimeField(required=True, default=datetime.now)

    meta = {
        'indexes': ['creation_date']
    }

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
