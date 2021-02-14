# -*- coding: utf-8 -*-

from datetime import datetime

from init import db
from models.enums import Apps, Providers
from models.model_mixin import ModelMixin
from models.prices import Price
from slugify import slugify


class Skin(ModelMixin, db.Document):

    app = db.EnumField(Apps, required=True)
    slug = db.StringField(required=True)

    name = db.StringField(required=True)
    image_url = db.URLField()
    creation_date = db.DateTimeField(required=True, default=datetime.now)

    prices = db.EmbeddedDocumentListField(Price)

    meta = {"indexes": ["app", "slug", "name"], "allow_inheritance": True}

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.slug = self.generate_slug()

    def __repr__(self) -> str:
        return f"<Skin id={self.id}, name={self.name}>"

    def __str__(self) -> str:
        return f"<Skin {self.id} - {self.name}>"

    @property
    def fullname(self) -> str:
        return self.name

    def generate_slug(self) -> str:
        return slugify(self.name)

    def add_price(self, provider: Providers, price: float):
        now = datetime.now()
        for price_ in self.prices:
            # very weird issue here when comparing enums directly instead of names
            # the result is sometimes False in a deamonized run when the values are actually the same...
            if price_.provider.name == provider.name:
                price_.price = price
                price_.update_date = now
                break
        else:
            self.prices.append(Price(price=price, provider=provider))
        self.save()
