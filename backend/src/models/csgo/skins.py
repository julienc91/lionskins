# -*- coding: utf-8 -*-

from init import db
from models.csgo.enums import (
    Collections,
    Qualities,
    Rarities,
    Types,
    WeaponCategories,
    Weapons,
)
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

    def __str__(self) -> str:
        return f"<Skin {self.id} - {self.market_hash_name}>"

    type = db.EnumField(Types)
    weapon = db.EnumField(Weapons)

    stat_trak = db.BooleanField()
    souvenir = db.BooleanField()
    quality = QualityField()
    rarity = db.EnumField(Rarities)
    market_hash_name = db.StringField()

    collection_ = db.EnumField(Collections, db_field="collection")
    description = db.DictField()

    meta = {
        "indexes": [
            "type",
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
        return self.market_hash_name

    def _get_market_hash_name(self) -> str:
        res = self._get_partial_market_hash_name()
        if self.quality and self.quality != Qualities.vanilla:
            res += " (" + self.quality.value + ")"
        return res

    def _get_partial_market_hash_name(self) -> str:
        if self.type == Types.agents:
            return self.name

        res = ""
        if self.weapon.category == WeaponCategories.knives:
            res += "★ "
        if self.souvenir:
            res += "Souvenir "
        elif self.stat_trak:
            res += "StatTrak™ "
        res += self.weapon.value
        if self.quality != Qualities.vanilla:
            res += " | " + self.name
        return res
