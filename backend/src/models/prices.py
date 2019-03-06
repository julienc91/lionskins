# -*- coding: utf-8 -*-

from datetime import datetime

from ..init import db
from .model_mixin import ModelMixin
from .enums import Providers


class Price(ModelMixin, db.EmbeddedDocument):

    _provider = db.StringField(db_field="provider", choices=Providers, required=True, unique=True)
    price = db.FloatField(required=True)
    creation_date = db.DateTimeField(required=True, default=datetime.now)
    update_date = db.DateTimeField(requured=True, default=datetime.now)

    meta = {
        'indexes': ['price']
    }

    @property
    def provider(self):
        return Providers[self._provider]

    @provider.setter
    def provider(self, value):
        self._provider = value.name
