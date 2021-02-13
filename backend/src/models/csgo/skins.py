# -*- coding: utf-8 -*-

from ...init import db
from ..enums import Apps
from ..skins import Skin as BaseSkin
from .enums import Categories, Collections, Qualities, Rarities
from .weapons import Weapon


class Skin(BaseSkin):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.app = Apps.csgo

    weapon = db.ReferenceField(Weapon, required=True)

    stat_trak = db.BooleanField(required=True)
    souvenir = db.BooleanField(required=True)
    quality = db.EnumField(Qualities, required=True)
    rarity = db.EnumField(Rarities)

    collection_ = db.EnumField(Collections, db_field="collection")
    description = db.DictField()

    meta = {"indexes": ["stat_trak", "souvenir", "quality", "rarity", "collection_"]}

    @property
    def fullname(self):
        res = self.market_hash_name
        if self.quality != Qualities.vanilla:
            res += " (" + self.quality.value + ")"
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
        res += self.weapon.name.value
        if self.quality != Qualities.vanilla:
            res += " | " + self.name
        return res
