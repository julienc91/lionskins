# -*- coding: utf-8 -*-

from datetime import datetime

from ..init import db
from .enums import Providers
from .model_mixin import ModelMixin
from .skins import Skin


class Redirect(ModelMixin, db.Document):

    skin = db.ReferenceField(Skin, required=True)
    _provider = db.StringField(db_field="provider", choices=Providers, required=True)

    tracker = db.StringField()

    creation_date = db.DateTimeField(required=True, default=datetime.now)

    meta = {"indexes": ["creation_date", "tracker"]}

    @property
    def provider(self):
        return Providers[self._provider]

    @provider.setter
    def provider(self, value):
        self._provider = value.name
