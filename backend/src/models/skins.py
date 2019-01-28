# -*- coding: utf-8 -*-

from datetime import datetime

import mongoengine
from slugify import slugify

from ..models.enums import Apps
from .model_mixin import ModelMixin
from .prices import Price


class Skin(ModelMixin, mongoengine.Document):

    _app = mongoengine.StringField(db_field="app", choices=Apps, required=True)
    slug = mongoengine.StringField(required=True)

    name = mongoengine.StringField(required=True)
    image_url = mongoengine.URLField()
    creation_date = mongoengine.DateTimeField(required=True, default=datetime.now)

    prices = mongoengine.EmbeddedDocumentListField(Price)

    meta = {
        'indexes': ['_app', 'slug', 'name'],
        'allow_inheritance': True,
    }

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.slug = self.generate_slug()

    def __repr__(self):
        return f'<Skin id={self.id}, name={self.name}>'

    def __str__(self):
        return f'<Skin {self.id} - {self.name}>'

    @property
    def fullname(self):
        return self.name

    def generate_slug(self):
        return slugify(self.name)

    @property
    def app(self):
        return Apps[self._app]

    @app.setter
    def app(self, value):
        self._app = value.name

    def add_price(self, provider, price):
        for price_ in self.prices:
            if price_.provider == provider:
                price_.price = price
                price_.update_date = datetime.now()
                break
        else:
            self.prices.append(Price(price=price, provider=provider))
        self.save()
