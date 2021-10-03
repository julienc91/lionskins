# -*- coding: utf-8 -*-

import re
from typing import Optional

from models import Apps
from models.csgo import Skin
from models.csgo.enums import Qualities, Rarities, Types, WeaponCategories, Weapons


class Parser:
    model = Skin

    @classmethod
    def parse_rarity(cls, rarity: str) -> Rarities:
        for r in Rarities:
            if r.value in rarity:
                return r
        other_rarities = {
            # Agents
            "Master Agent": Rarities.covert,
            "Superior Agent": Rarities.classified,
            "Exceptional Agent": Rarities.restricted,
            "Distinguished Agent": Rarities.mil_spec,
            # Graffitis
            "Exotic Graffiti": Rarities.classified,
            "Remarkable Graffiti": Rarities.restricted,
            "High Grade Graffiti": Rarities.mil_spec,
            "Base Grade Graffiti": Rarities.consumer_grade,
            # Stickers
            "Extraordinary Sticker": Rarities.covert,
            "Exotic Sticker": Rarities.classified,
            "Remarkable Sticker": Rarities.restricted,
            "High Grade Sticker": Rarities.mil_spec,
        }
        for r in other_rarities:
            if r in rarity:
                return other_rarities[r]
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
            "Brazilian 1st Battalion",
            "Elite Crew",
            "FBI",
            "FBI HRT",
            "FBI Sniper",
            "FBI SWAT",
            "Gendarmerie Nationale",
            "Guerrilla Warfare",
            "KSK",
            "NSWC SEAL",
            "NZSAS",
            "Phoenix",
            "Sabre",
            "Sabre Footsoldier",
            "SAS",
            "SEAL Frogman",
            "SWAT",
            "TACP Cavalry",
            "The Professionals",
            "USAF TACP",
        }
        if right_split.strip() not in agents_families:
            return None
        return {"name": item_name, "type": Types.agents}

    @classmethod
    def _parse_music_kit_item(cls, item_name: str) -> Optional[dict]:
        left_split, _, right_split = item_name.partition("|")
        if "Music Kit" not in left_split or not right_split:
            return None

        stat_trak = "StatTrak" in left_split
        return {"name": right_split.strip(), "type": Types.music_kits, "stat_trak": stat_trak, "souvenir": False}

    @classmethod
    def _parse_graffiti_item(cls, item_name: str) -> Optional[dict]:
        left_split, _, right_split = item_name.partition("|")
        if "Sealed Graffiti" not in left_split or not right_split:
            return None
        return {"name": right_split.strip(), "type": Types.graffitis}

    @classmethod
    def _parse_sticker_item(cls, item_name: str) -> Optional[dict]:
        left_split, _, right_split = item_name.partition("|")
        if "Sticker" not in left_split or not right_split:
            return None
        return {"name": right_split.strip(), "type": Types.stickers}

    @classmethod
    def _parse_pin_item(cls, item_name: str) -> Optional[dict]:
        if not item_name.endswith(" Pin"):
            return None
        return {"name": item_name, "type": Types.pins}

    @classmethod
    def _parse_patch_item(cls, item_name: str) -> Optional[dict]:
        left_split, _, right_split = item_name.partition("|")
        if "Patch" not in left_split or not right_split:
            return None
        return {"name": right_split.strip(), "type": Types.patches}

    @classmethod
    def _parse_item_name(cls, item_name: str) -> Optional[dict]:
        data = cls._parse_weapon_item(item_name)
        if data is None:
            data = cls._parse_music_kit_item(item_name)
        if data is None:
            data = cls._parse_graffiti_item(item_name)
        if data is None:
            data = cls._parse_sticker_item(item_name)
        if data is None:
            data = cls._parse_patch_item(item_name)
        if data is None:
            data = cls._parse_pin_item(item_name)
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
