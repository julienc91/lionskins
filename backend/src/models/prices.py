# -*- coding: utf-8 -*-

from datetime import datetime

from init import db
from models.enums import Providers
from models.model_mixin import ModelMixin


class Price(ModelMixin, db.EmbeddedDocument):

    provider = db.EnumField(Providers, required=True)
    price = db.FloatField(required=True)
    creation_date = db.DateTimeField(required=True, default=datetime.now)
    update_date = db.DateTimeField(requured=True, default=datetime.now)

    meta = {"indexes": ["price"]}
