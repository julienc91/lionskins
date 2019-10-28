# -*- coding: utf-8 -*-

import re
import enum
import urllib.parse


class Apps(enum.Enum):

    csgo = "Counter-Strike: Global Offensive"


class Providers(enum.Enum):
    steam = "Steam"
    bitskins = "BitSkins"
    csgoshop = "CSGOShop"
    lootbear = "LootBear"
    skinbaron = "SkinBaron"
    opskins = "OPSkins"

    def get_skin_url(self, skin):
        base_url = ''
        parameters = {}

        if skin.app == Apps.csgo:
            if self == self.bitskins:
                base_url = 'https://bitskins.com/'
                parameters = {
                    'l': 'en',
                    'app_id': 730,
                    'market_hash_name': skin.market_hash_name,
                    'item_wear': skin.quality.value,
                    'is_stattrak': 1 if skin.stat_trak else -1,
                    'is_souvenir': 1 if skin.souvenir else -1,
                    'sort_by': 'price',
                    'order': 'asc',
                }
            elif self == self.csgoshop:
                base_url = 'https://csgoshop.com/item/'
                path = skin.market_hash_name + "-" + skin.quality.value
                path = path.lower()
                path = re.sub(r'[^\x00-\x7F]', '', path).strip()
                path = re.sub(r'[\s |]+', '-', path)
                base_url += path
            elif self == self.lootbear:
                base_url = 'https://app.lootbear.com/items/'
                base_url += skin.market_hash_name + "/" + skin.quality.value
            elif self == self.steam:
                base_url = 'https://steamcommunity.com/market/listings/730/'
                base_url += skin.market_hash_name + " (" + skin.quality.value + ")"
            elif self == self.skinbaron:
                base_url = "https://skinbaron.de/#!"
                parameters = {
                    'appId': 730,
                    'wf': (skin.quality.to_int() - 1),
                    'tli': 8,
                    'souvenir': 1 if skin.souvenir else 0,
                    'statTrak': 1 if skin.stat_trak else 0,
                    'sort': 'CF',
                    'str': skin.market_hash_name
                }

        if parameters:
            base_url += "?" + urllib.parse.urlencode(parameters)
        return base_url


class Currencies(enum.Enum):
    eur = "€"
    usd = "$"
