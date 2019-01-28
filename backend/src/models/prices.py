# -*- coding: utf-8 -*-

from datetime import datetime

import mongoengine

from .model_mixin import ModelMixin
from .enums import Providers


class Price(ModelMixin, mongoengine.EmbeddedDocument):

    _provider = mongoengine.StringField(db_field="provider", choices=Providers, required=True, unique=True)
    price = mongoengine.FloatField(required=True)
    creation_date = mongoengine.DateTimeField(required=True, default=datetime.now)
    update_date = mongoengine.DateTimeField(requured=True, default=datetime.now)

    meta = {
        'indexes': ['price']
    }

    @property
    def provider(self):
        return Providers[self._provider]

    @provider.setter
    def provider(self, value):
        self._provider = value.name
