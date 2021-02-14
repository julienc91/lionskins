# -*- coding: utf-8 -*-

import re
from typing import Optional

from src.models import Apps
from src.models.csgo import Skin
from src.models.csgo.enums import Categories, Qualities, Rarities, Weapons


class Parser:
    app_id = 730

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
    def get_skin_from_item_name(cls, item_name: str) -> Optional[Skin]:
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

        return Skin.get_or_create(
            name=skin_name, app=Apps.csgo, weapon=weapon, quality=quality, stat_trak=stat_trak, souvenir=souvenir
        )
