# -*- coding: utf-8 -*-

from datetime import datetime

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
