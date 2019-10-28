# -*- coding: utf-8 -*-

from ...init import db
from ..enums import Apps
from ..skins import Skin as BaseSkin
from .enums import Collections, Rarities, Qualities, Categories
from .weapons import Weapon


class Skin(BaseSkin):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.app = Apps.csgo

    weapon = db.ReferenceField(Weapon, required=True)

    stat_trak = db.BooleanField(required=True)
    souvenir = db.BooleanField(required=True)
    _quality = db.IntField(db_field="quality", required=True)
    _rarity = db.StringField(db_field="rarity", choices=Rarities)

    _collection_ = db.StringField(db_field="collection", choices=Collections)
    description = db.DictField()

    meta = {"indexes": ["stat_trak", "souvenir", "_quality", "_rarity", "_collection_"]}

    @property
    def fullname(self):
        res = ""
        if self.stat_trak:
            res += "StatTrak "
        res += self.weapon.pk
        if self.souvenir:
            res += " (Souvenir)"
        res += " | " + self.name + " "
        res += "(" + self.quality.value + ")"
        return res

    @property
    def market_hash_name(self):
        res = ""
        if self.weapon.category == Categories.knives:
            res += "★ "
        if self.souvenir:
            res += "Souvenir "
        elif self.stat_trak:
            res += "StatTrak™ "
        res += self.weapon.name.value + " | " + self.name
        return res

    @property
    def quality(self):
        return Qualities.from_int(self._quality)

    @quality.setter
    def quality(self, value):
        self._quality = value.to_int()

    @property
    def rarity(self):
        try:
            return Rarities[self._rarity]
        except KeyError:
            return None

    @rarity.setter
    def rarity(self, value):
        self._rarity = value.name

    @property
    def collection(self):
        try:
            return Collections[self._collection_]
        except KeyError:
            return None

    @collection.setter
    def collection(self, value):
        self._collection_ = value.name if value else None

    @classmethod
    def _parse_kwargs(cls, kwargs):
        if "quality" in kwargs:
            try:
                kwargs["_quality"] = kwargs.pop("quality").to_int()
            except AttributeError:
                pass
        return super()._parse_kwargs(kwargs)
