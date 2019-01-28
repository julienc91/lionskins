# -*- coding: utf-8 -*-

import os
from datetime import datetime

import requests
import mongoengine
from flask import request

from .model_mixin import ModelMixin


class Contact(ModelMixin, mongoengine.Document):

    name = mongoengine.StringField()
    email = mongoengine.EmailField()
    message = mongoengine.StringField(required=True)

    creation_date = mongoengine.DateTimeField(required=True, default=datetime.now)

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
