# -*- coding: utf-8 -*-

from datetime import datetime

from ..init import db
from .enums import Providers
from .model_mixin import ModelMixin


class History(ModelMixin, db.Document):

    skin = db.ReferenceField('Skin', required=True)
    _provider = db.StringField(db_field="provider", choices=Providers, required=True)
    price = db.FloatField(required=True)
    creation_date = db.DateTimeField(required=True, default=datetime.now)

    meta = {
        'indexes': ['skin', '_provider', 'creation_date']
    }

    @property
    def provider(self):
        return Providers[self._provider]

    @provider.setter
    def provider(self, value):
        self._provider = value.name
