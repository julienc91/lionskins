# -*- coding: utf-8 -*-

import uuid
from datetime import datetime

from slugify import slugify

from ..init import sqlalchemy as db
from ..models.enums import Apps
from .model_mixin import ModelMixin


class Skin(ModelMixin, db.Model):

    __tablename__ = 'skins'

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    app = db.Column(db.Enum(Apps, name="type_apps"), index=True)
    slug = db.Column(db.String(255), index=True, nullable=False)

    name = db.Column(db.String(127), index=True, nullable=False)
    image_url = db.Column(db.String(511), nullable=False)
    creation_date = db.Column(db.DateTime, default=datetime.now, nullable=False)

    prices = db.relationship('models.prices.Price')

    __mapper_args__ = {'polymorphic_on': app}

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
