# -*- coding: utf-8 -*-

from datetime import datetime

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
