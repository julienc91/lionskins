import urllib
import uuid

from django.db import models
from django.utils import timezone

from lionskins.models.enums import Providers

from .enums import Collections, Qualities, Rarities, Types, WeaponCategories, Weapons


class Skin(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    object_id = models.CharField(max_length=24, db_index=True, unique=True)
    type = models.CharField(max_length=32, db_index=True, choices=Types.choices)
    market_hash_name = models.CharField(max_length=255, db_index=True, unique=True)
    group_name = models.CharField(max_length=255)
    group_slug = models.CharField(max_length=255, db_index=True)
    image_url = models.URLField(max_length=512, blank=True, null=True)
    creation_date = models.DateTimeField(default=timezone.now)
    update_date = models.DateTimeField(default=timezone.now)

    weapon = models.CharField(
        max_length=32, db_index=True, choices=Weapons.choices, null=True
    )
    stat_trak = models.BooleanField(null=True)
    souvenir = models.BooleanField(null=True)
    quality = models.PositiveSmallIntegerField(
        db_index=True, choices=Qualities.choices, null=True
    )
    rarity = models.CharField(max_length=32, choices=Rarities.choices, null=True)
    collection = models.CharField(max_length=64, choices=Collections.choices, null=True)
    description = models.JSONField(null=True)

    class Meta:
        ordering = ["-type", "weapon", "group_slug", "souvenir", "stat_trak", "quality"]

    def _get_market_hash_name(self) -> str:
        res = self.get_partial_market_hash_name()
        if self.quality and self.quality != Qualities.vanilla:
            res += f" ({self.quality})"
        return res

    def get_partial_market_hash_name(self) -> str:
        if self.type == Types.agents or self.type == Types.pins:
            return self.group_name
        elif self.type == Types.music_kits:
            prefix = "Music Kit"
            if self.stat_trak:
                prefix = "StatTrak™ " + prefix
            return f"{prefix} | {self.group_name}"
        elif self.type == Types.graffitis:
            return f"Sealed Graffiti | {self.group_name}"
        elif self.type == Types.stickers:
            return f"Sticker | {self.group_name}"
        elif self.type == Types.patches:
            return f"Patch | {self.group_name}"

        res = ""
        if Weapons(self.weapon).category == WeaponCategories.knives:
            res += "★ "
        if self.souvenir:
            res += "Souvenir "
        elif self.stat_trak:
            res += "StatTrak™ "
        res += self.weapon
        if self.quality != Qualities.vanilla:
            res += f" | {self.group_name}"
        return res

    def get_skin_url(self, provider: Providers):
        base_url = ""
        parameters = {}

        if provider == Providers.bitskins:
            base_url = "https://bitskins.com/"
            parameters = {
                "l": "en",
                "app_id": 730,
                "market_hash_name": self.get_partial_market_hash_name(),
                "sort_by": "price",
                "order": "asc",
                "ref_alias": "tbyygmpSeDE",
            }
            if self.quality:
                parameters["item_wear"] = self.get_quality_display()
            if self.stat_trak is not None:
                parameters["is_stattrak"] = 1 if self.stat_trak else -1
            if self.souvenir is not None:
                parameters["is_souvenir"] = 1 if self.souvenir else -1

        elif provider == Providers.csmoney:
            base_url = "https://cs.money/csgo/store/"
            parameters = {
                "sort": "price",
                "order": "asc",
                "search": self.get_partial_market_hash_name(),
            }
            if self.quality and self.quality != Qualities.vanilla:
                parameters["exterior"] = {
                    Qualities.factory_new: "Factory New",
                    Qualities.minimal_wear: "Minimal Wear",
                    Qualities.field_tested: "Field-Tested",
                    Qualities.well_worn: "Well-Word",  # sic
                    Qualities.battle_scarred: "Battle-Scared",  # re-sic
                }
            elif self.quality == Qualities.vanilla:
                parameters["search"] += " vanilla"
            if self.stat_trak is not None:
                parameters["isStatTrak"] = "true" if self.stat_trak else "false"
            if self.souvenir is not None:
                parameters["isSouvenir"] = "true" if self.souvenir else "false"
        elif provider == Providers.skinbaron:
            base_url = "https://skinbaron.de/?affiliateId=393#!"
            parameters = {
                "appId": 730,
                "sort": "CF",
                "str": self.get_partial_market_hash_name(),
            }
            if self.souvenir:
                parameters["souvenir"] = 1
            if self.stat_trak:
                parameters["statTrak"] = 1
            if self.quality == Qualities.vanilla:
                parameters["unpainted"] = 1
            elif self.quality:
                parameters["wf"] = self.quality - 1
        elif provider == Providers.skinport:
            base_url = "https://skinport.com/market/730"
            if self.type == Types.agents:
                parameters = {
                    "cat": "Agent",
                    "search": self.group_name.split("|")[0].strip(),
                }
            elif self.type == Types.music_kits:
                parameters = {
                    "cat": "Music Kit",
                    "search": self.group_name,
                    "stattrak": int(self.stat_trak),
                }
            elif self.type == Types.graffitis:
                parameters = {"cat": "Graffiti", "search": self.group_name}
            elif self.type == Types.stickers:
                parameters = {"cat": "Sticker", "search": self.group_name}
            elif self.type == Types.pins:
                parameters = {"cat": "Collectible", "search": self.group_name}
            elif self.type == Types.patches:
                parameters = {"cat": "Patch", "search": self.group_name}
            else:
                parameters = {
                    "type": self.get_weapon_display(),
                    "item": self.group_name,
                }
                if self.stat_trak is not None:
                    parameters["stattrak"] = int(self.stat_trak)
                    parameters["souvenir"] = int(self.souvenir)
                if self.quality and self.quality != Qualities.vanilla:
                    parameters["exterior"] = {
                        Qualities.battle_scarred: 1,
                        Qualities.factory_new: 2,
                        Qualities.field_tested: 3,
                        Qualities.minimal_wear: 4,
                        Qualities.well_worn: 5,
                    }.get(self.quality, 0)
                elif self.quality:
                    parameters["vanilla"] = 1
        elif provider == Providers.steam:
            base_url = "https://steamcommunity.com/market/listings/730/"
            base_url += self.market_hash_name

        if parameters:
            base_url += "?" + urllib.parse.urlencode(parameters)
        return base_url
