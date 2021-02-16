# -*- coding: utf-8 -*-

from init import db
from models.csgo.enums import Categories, Collections, Qualities, Rarities, Weapons
from models.enums import Apps
from models.skins import Skin as BaseSkin


class QualityField(db.EnumField):
    def __init__(self, **kwargs):
        super().__init__(Qualities, **kwargs)

    def to_mongo(self, value):
        if isinstance(value, self._enum_cls):
            return value.to_int()
        return value

    def to_python(self, value):
        try:
            return self._enum_cls.from_int(int(value))
        except (TypeError, ValueError, KeyError):
            return value


class Skin(BaseSkin):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.app = Apps.csgo

    weapon = db.EnumField(Weapons, required=True)

    stat_trak = db.BooleanField(required=True)
    souvenir = db.BooleanField(required=True)
    quality = QualityField(required=True)
    rarity = db.EnumField(Rarities)
    market_hash_name = db.StringField()

    collection_ = db.EnumField(Collections, db_field="collection")
    description = db.DictField()

    meta = {
        "indexes": [
            "weapon",
            "stat_trak",
            "souvenir",
            "quality",
            "rarity",
            "collection_",
            "market_hash_name",
            "$market_hash_name",
        ]
    }

    def save(self, *args, **kwargs):
        self.market_hash_name = self._get_market_hash_name()
        return super().save(*args, **kwargs)

    @property
    def fullname(self):
        if not self.market_hash_name:
            return self._get_market_hash_name()
        return self.market_hash_name

    def _get_market_hash_name(self) -> str:
        res = self._get_partial_market_hash_name()
        if self.quality and self.quality != Qualities.vanilla:
            res += " (" + self.quality.value + ")"
        return res

    def _get_partial_market_hash_name(self) -> str:
        res = ""
        if self.weapon.category == Categories.knives:
            res += "★ "
        if self.souvenir:
            res += "Souvenir "
        elif self.stat_trak:
            res += "StatTrak™ "
        res += self.weapon.value
        if self.quality != Qualities.vanilla:
            res += " | " + self.name
        return res
