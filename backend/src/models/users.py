# -*- coding: utf-8 -*-

from datetime import datetime

from passlib.hash import pbkdf2_sha512

from ..init import db
from .model_mixin import ModelMixin


class User(ModelMixin, db.Document):

    username = db.StringField(required=True, unique=True)
    password = db.StringField(required=True)

    creation_date = db.DateTimeField(required=True, default=datetime.now)
    last_login = db.DateTimeField(required=True, default=datetime.now)

    TEMPORARY_PASSWORD = "!"

    meta = {"indexes": ["username"]}

    @property
    def jwt_identity(self):
        return str(self.id)

    def set_password(self, raw_password):
        self.password = pbkdf2_sha512.hash(raw_password)
        self.save()

    def set_last_login(self):
        self.last_login = datetime.now()
        self.save()

    def check_password(self, raw_password):
        return self.password != self.TEMPORARY_PASSWORD and pbkdf2_sha512.verify(raw_password, self.password)

    @classmethod
    def create(cls, **kwargs):
        password = kwargs.pop("password")
        res = super().create(password=cls.TEMPORARY_PASSWORD, **kwargs)
        res.set_password(password)
        return res
