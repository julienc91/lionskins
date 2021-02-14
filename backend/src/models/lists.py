# -*- coding: utf-8 -*-

from datetime import datetime

from init import db
from models.model_mixin import ModelMixin
from slugify import slugify


class Item(ModelMixin, db.EmbeddedDocument):
    skin = db.ReferenceField("Skin", required=True)
    creation_date = db.DateTimeField(required=True, default=datetime.now)


class ItemContainer(ModelMixin, db.EmbeddedDocument):
    items = db.EmbeddedDocumentListField(Item)


class List(ModelMixin, db.Document):
    user = db.ReferenceField("User", required=True)
    name = db.StringField(required=True)
    description = db.StringField()
    slug = db.StringField(required=True)
    creation_date = db.DateTimeField(required=True, default=datetime.now)
    update_date = db.DateTimeField(requured=True, default=datetime.now)

    item_containers = db.EmbeddedDocumentListField(ItemContainer)

    @classmethod
    def generate_slug(cls, user, name):
        return slugify(name) or "list"
