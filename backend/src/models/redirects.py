# -*- coding: utf-8 -*-

from datetime import datetime

from src.init import db
from src.models.enums import Providers
from src.models.model_mixin import ModelMixin
from src.models.skins import Skin


class Redirect(ModelMixin, db.Document):

    skin = db.ReferenceField(Skin, required=True)
    provider = db.EnumField(Providers, required=True)

    tracker = db.StringField()

    creation_date = db.DateTimeField(required=True, default=datetime.now)

    meta = {"indexes": ["creation_date", "tracker"]}
