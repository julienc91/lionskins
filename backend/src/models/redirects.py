# -*- coding: utf-8 -*-

import uuid
from datetime import datetime

from ..init import sqlalchemy as db
from .model_mixin import ModelMixin


class Redirect(ModelMixin, db.Model):

    __tablename__ = 'redirects'

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))

    skin_id = db.Column(db.ForeignKey('skins.id'), nullable=False)
    provider_id = db.Column(db.ForeignKey('providers.id'), nullable=False)

    tracker = db.Column(db.String(127), index=True)
    creation_date = db.Column(db.DateTime, default=datetime.now, nullable=False, index=True)

    skin = db.relationship('models.skins.Skin')
    provider = db.relationship('models.providers.Provider')
