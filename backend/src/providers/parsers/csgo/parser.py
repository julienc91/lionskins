# -*- coding: utf-8 -*-

import re
from typing import Optional

from models import Apps
from models.csgo import Skin
from models.csgo.enums import Qualities, Rarities, Types, WeaponCategories, Weapons


class Parser:
    app_id = 730
    model = Skin

    @classmethod
    def parse_rarity(cls, rarity: str) -> Rarities:
        for r in Rarities:
            if r.value in rarity:
                return r
        agent_rarities = {
            "Master": Rarities.covert,
            "Superior": Rarities.classified,
            "Exceptional": Rarities.restricted,
            "Distinguished": Rarities.mil_spec,
        }
        for r in agent_rarities:
            if r in rarity:
                return agent_rarities[r]
        raise ValueError

    @classmethod
    def _validate_item_name(cls, item_name: str) -> bool:
        return bool(cls._parse_item_name(item_name))

    @classmethod
    def _parse_weapon_item(cls, item_name: str) -> Optional[dict]:
        left_split, _, right_split = item_name.partition("|")

        stat_trak = "StatTrak" in left_split
        souvenir = "Souvenir" in left_split

        left_split = re.sub(r"^(★\s?)?(StatTrak™?)?", "", left_split).strip()
        left_split = re.sub(r"^Souvenir", "", left_split).strip()

        try:
            weapon = Weapons(left_split)
        except ValueError:
            return None

        if right_split:
            try:
                quality = re.search(r"\(([\w\s-]+)\)$", right_split).group(1)
                quality = Qualities(quality)
            except (ValueError, AttributeError):
                return None
            skin_name = right_split.replace(f"({quality.value})", "").strip()
        elif weapon.category is not WeaponCategories.knives:
            return None
        else:
            skin_name = "Vanilla"
            quality = Qualities.vanilla
        return {
            "name": skin_name,
            "type": Types.weapons,
            "weapon": weapon,
            "quality": quality,
            "stat_trak": stat_trak,
            "souvenir": souvenir,
        }

    @classmethod
    def _parse_agent_item(cls, item_name: str) -> Optional[dict]:
        left_split, _, right_split = item_name.partition("|")
        if not left_split or not right_split:
            return None

        agents_families = {
            "Elite Crew",
            "FBI",
            "FBI HRT",
            "FBI Sniper",
            "FBI SWAT",
            "KSK",
            "NSWC SEAL",
            "Phoenix",
            "Sabre",
            "Sabre Footsoldier",
            "SAS",
            "SWAT",
            "TACP Cavalry",
            "The Professionals",
            "USAF TACP",
        }
        if right_split.strip() not in agents_families:
            return None
        return {"name": item_name, "type": Types.agents}

    @classmethod
    def _parse_item_name(cls, item_name: str) -> Optional[dict]:
        if item_name.startswith(("Music Kit", "Patch", "Sealed Graffiti", "Sticker")):
            return None

        data = cls._parse_weapon_item(item_name)
        if data is None:
            data = cls._parse_agent_item(item_name)
        return data

    @classmethod
    def get_or_create_skin_from_item_name(cls, item_name: str) -> Optional[Skin]:
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
