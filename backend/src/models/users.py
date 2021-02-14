# -*- coding: utf-8 -*-

from datetime import datetime

from init import db
from models.model_mixin import ModelMixin


class User(ModelMixin, db.Document):

    steam_id = db.StringField(required=True, unique=True)
    username = db.StringField(required=True)
    creation_date = db.DateTimeField(required=True, default=datetime.now)
    last_login = db.DateTimeField(required=True, default=datetime.now)

    meta = {"indexes": ["steam_id"]}

    @property
    def jwt_identity(self):
        return str(self.id)

    def set_last_login(self):
        self.last_login = datetime.now()
        self.save()
