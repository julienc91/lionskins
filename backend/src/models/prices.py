# -*- coding: utf-8 -*-

from datetime import datetime

from ..init import sqlalchemy as db
from .model_mixin import ModelMixin


class Price(ModelMixin, db.Model):

    __tablename__ = 'prices'

    skin_id = db.Column(db.ForeignKey('skins.id'), primary_key=True)
    provider_id = db.Column(db.ForeignKey('providers.id'), primary_key=True)

    price = db.Column(db.Float(), index=True)
    creation_date = db.Column(db.DateTime, default=datetime.now, nullable=False)

    skin = db.relationship('models.skins.Skin')
    provider = db.relationship('models.providers.Provider')
