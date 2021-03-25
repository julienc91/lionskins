# -*- coding: utf-8 -*-

import re
from typing import Optional

from models import Apps
from models.csgo import Skin
from models.csgo.enums import Categories, Qualities, Rarities, Weapons


class Parser:
    app_id = 730
    model = Skin

    @classmethod
    def parse_rarity(cls, rarity: str) -> Rarities:
        for r in Rarities:
            if r.value in rarity:
                return r
        raise ValueError

    @classmethod
    def _parse_quality(cls, quality: str) -> Qualities:
        return Qualities(quality)

    @classmethod
    def _parse_weapon(cls, weapon: str) -> Weapons:
        return Weapons(weapon)

    @classmethod
    def _validate_item_name(cls, item_name: str) -> bool:
        return bool(cls._parse_item_name(item_name))

    @classmethod
    def _parse_item_name(cls, item_name: str):
        left_split, _, right_split = item_name.partition("|")

        stat_trak = "StatTrak" in left_split
        souvenir = "Souvenir" in left_split

        left_split = re.sub(r"^(★\s?)?(StatTrak™?)?", "", left_split).strip()
        left_split = re.sub(r"^Souvenir", "", left_split).strip()

        weapon = left_split

        try:
            weapon = cls._parse_weapon(weapon)
        except ValueError:
            return None

        if right_split:
            try:
                quality = re.search(r"\(([\w\s-]+)\)$", right_split).group(1)
                quality = cls._parse_quality(quality)
            except (ValueError, AttributeError):
                return None
            skin_name = right_split.replace(f"({quality.value})", "").strip()
        elif weapon.category is not Categories.knives:
            return None
        else:
            skin_name = "Vanilla"
            quality = Qualities.vanilla
        return {"name": skin_name, "weapon": weapon, "quality": quality, "stat_trak": stat_trak, "souvenir": souvenir}

    @classmethod
    def get_or_create_skin_from_item_name(cls, item_name: str) -> Optional[Skin]:
        skin = cls.get_skin_from_item_name(item_name)
        if skin:
            return skin

        kwargs = cls._parse_item_name(item_name)
        if not kwargs:
            return None

        return cls.model.get_or_create(app=Apps.csgo, **kwargs)

    @classmethod
    def get_skin_from_item_name(cls, item_name: str) -> Optional[Skin]:
        if not cls._validate_item_name(item_name):
            return None

        try:
            return cls.model.objects.get(app=Apps.csgo, market_hash_name=item_name)
        except cls.model.DoesNotExist:
            return None
