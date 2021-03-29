# -*- coding: utf-8 -*-

import enum
import urllib.parse

from models.csgo.enums import Types


class Apps(enum.Enum):

    csgo = "Counter-Strike: Global Offensive"


class Providers(enum.Enum):
    steam = "Steam"
    bitskins = "BitSkins"
    csmoney = "CSMoney"
    skinbaron = "SkinBaron"
    skinport = "Skinport"

    def get_skin_url(self, skin):
        base_url = ""
        parameters = {}

        if skin.app == Apps.csgo:
            from models.csgo.enums import Qualities

            if self == self.bitskins:
                base_url = "https://bitskins.com/"
                parameters = {
                    "l": "en",
                    "app_id": 730,
                    "market_hash_name": skin.market_hash_name,
                    "sort_by": "price",
                    "order": "asc",
                    "ref_alias": "tbyygmpSeDE",
                }
                if skin.quality:
                    parameters["item_wear"] = skin.quality.value
                if skin.stat_trak is not None:
                    parameters["is_stattrak"] = 1 if skin.stat_trak else -1
                if skin.souvenir is not None:
                    parameters["is_souvenir"] = 1 if skin.souvenir else -1

            elif self == self.csmoney:
                # there are no per-skin url on this site
                base_url = "https://cs.money/csgo/store/"
            elif self == self.skinbaron:
                base_url = "https://skinbaron.de/?affiliateId=393#!"
                parameters = {"appId": 730, "sort": "CF", "str": skin.market_hash_name}
                if skin.souvenir:
                    parameters["souvenir"] = 1
                if skin.stat_trak:
                    parameters["statTrak"] = 1
                if skin.quality == Qualities.vanilla:
                    parameters["unpainted"] = 1
                elif skin.quality:
                    parameters["wf"] = skin.quality.to_int() - 1
            elif self == self.skinport:
                base_url = "https://skinport.com/market/730"
                if skin.type is Types.agents:
                    parameters = {"cat": "Agent", "search": skin.name.split("|")[0].strip()}
                else:
                    parameters = {
                        "type": skin.weapon.value,
                        "item": skin.name,
                    }
                    if skin.stat_trak is not None:
                        parameters["stattrak"] = int(skin.stat_trak)
                        parameters["souvenir"] = int(skin.souvenir)
                    if skin.quality and skin.quality != Qualities.vanilla:
                        parameters["exterior"] = {
                            Qualities.battle_scarred: 1,
                            Qualities.factory_new: 2,
                            Qualities.field_tested: 3,
                            Qualities.minimal_wear: 4,
                            Qualities.well_worn: 5,
                        }.get(skin.quality, 0)
                    elif skin.quality:
                        parameters["vanilla"] = 1
            elif self == self.steam:
                base_url = "https://steamcommunity.com/market/listings/730/"
                base_url += skin.fullname

        if parameters:
            base_url += "?" + urllib.parse.urlencode(parameters)
        return base_url


class Currencies(enum.Enum):
    eur = "€"
    usd = "$"
