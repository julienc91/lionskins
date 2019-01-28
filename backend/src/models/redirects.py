# -*- coding: utf-8 -*-

from datetime import datetime

import mongoengine

from .model_mixin import ModelMixin
from .enums import Providers
from .skins import Skin


class Redirect(ModelMixin, mongoengine.Document):

    skin = mongoengine.ReferenceField(Skin, required=True)
    _provider = mongoengine.StringField(db_field="provider", choices=Providers, required=True)

    tracker = mongoengine.StringField()

    creation_date = mongoengine.DateTimeField(required=True, default=datetime.now)

    meta = {
        'indexes': ['creation_date', 'tracker']
    }

    @property
    def provider(self):
        return Providers[self._provider]

    @provider.setter
    def provider(self, value):
        self._provider = value.name
