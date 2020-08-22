# -*- coding: utf-8 -*-

import enum
import urllib.parse


class Apps(enum.Enum):

    csgo = "Counter-Strike: Global Offensive"


class Providers(enum.Enum):
    steam = "Steam"
    bitskins = "BitSkins"
    csmoney = "CSMoney"
    skinbaron = "SkinBaron"

    def get_skin_url(self, skin):
        base_url = ""
        parameters = {}

        if skin.app == Apps.csgo:
            from .csgo.enums import Qualities

            if self == self.bitskins:
                base_url = "https://bitskins.com/"
                parameters = {
                    "l": "en",
                    "app_id": 730,
                    "market_hash_name": skin.market_hash_name,
                    "item_wear": skin.quality.value,
                    "is_stattrak": 1 if skin.stat_trak else -1,
                    "is_souvenir": 1 if skin.souvenir else -1,
                    "sort_by": "price",
                    "order": "asc",
                    "ref_alias": "tbyygmpSeDE",
                }
            elif self == self.csmoney:
                # there are no per-skin url on this site
                base_url = "https://cs.money/"
            elif self == self.skinbaron:
                base_url = "https://skinbaron.de/?affiliateId=393#!"
                parameters = {"appId": 730, "sort": "CF", "str": skin.market_hash_name}
                if skin.souvenir:
                    parameters["souvenir"] = 1
                if skin.stat_trak:
                    parameters["statTrak"] = 1
                if skin.quality == Qualities.vanilla:
                    parameters["unpainted"] = 1
                else:
                    parameters["wf"] = skin.quality.to_int() - 1
            elif self == self.steam:
                base_url = "https://steamcommunity.com/market/listings/730/"
                base_url += skin.fullname

        if parameters:
            base_url += "?" + urllib.parse.urlencode(parameters)
        return base_url


class Currencies(enum.Enum):
    eur = "€"
    usd = "$"
