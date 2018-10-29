# -*- coding: utf-8 -*-

import re
import urllib.parse

from ..init import sqlalchemy as db
from .model_mixin import ModelMixin
from .enums import Providers, Apps


class Provider(ModelMixin, db.Model):

    __tablename__ = 'providers'

    id = db.Column(db.Enum(Providers, name="type_providers"), primary_key=True)

    @property
    def name(self):
        return self.id

    def get_skin_url(self, skin):
        base_url = ''
        parameters = {}

        if skin.app == Apps.csgo:
            if self.id == Providers.bitskins:
                base_url = 'https://bitskins.com/'
                parameters = {
                    'l': 'en',
                    'app_id': 730,
                    'market_hash_name': skin.market_hash_name,
                    'item_wear': skin.quality.value,
                    'is_stattrak': 1 if skin.stat_trak else -1,
                    'is_souvenir': 1 if skin.souvenir else -1,
                    'sort_by': 'price',
                    'order': 'asc',
                }
            elif self.id == Providers.csgoshop:
                base_url = 'https://csgoshop.com/item/'
                path = skin.market_hash_name + "-" + skin.quality.value
                path = path.lower()
                path = re.sub(r'[^\x00-\x7F]', '', path).strip()
                path = re.sub(r'[\s |]+', '-', path)
                base_url += path
            elif self.id == Providers.lootbear:
                base_url = 'https://app.lootbear.com/items/'
                base_url += skin.market_hash_name + "/" + skin.quality.value
            elif self.id == Providers.steam:
                base_url = 'https://steamcommunity.com/market/listings/730/'
                base_url += skin.market_hash_name + " (" + skin.quality.value + ")"

        if parameters:
            base_url += "?" + urllib.parse.urlencode(parameters)
        return base_url
