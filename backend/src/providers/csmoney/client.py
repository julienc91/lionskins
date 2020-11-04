# -*- coding: utf-8 -*-

import json
import re

import requests
from ratelimit import limits, sleep_and_retry

from ...models import Apps, Providers
from ..abstract_provider import AbstractProvider
from ..exceptions import UnfinishedJob


class Client(AbstractProvider):
    provider = Providers.csmoney
    base_url = "https://old.cs.money/"

    @staticmethod
    def get_parser(app):
        if app == Apps.csgo:
            from ..parsers.csgo import Parser

            return Parser
        raise NotImplementedError

    @sleep_and_retry
    @limits(calls=5, period=1)
    def __get(self, method, params=None):
        if not params:
            params = {}
        return requests.get(self.base_url + method, params)

    def get_prices(self):
        res = self.__get("js/database-skins/library-en-730.js")
        if res.status_code >= 500:
            raise UnfinishedJob

        prefix_length = len("skinsBaseList[730] = ")
        skins_db = res.content[prefix_length:]
        skins_db = json.loads(skins_db)

        res = self.__get("730/load_bots_inventory")
        if res.status_code >= 500:
            raise UnfinishedJob

        offers = res.json()
        skins = {}
        for offer in offers:
            skin_id = str(offer["o"])
            skin = skins_db.get(skin_id)
            if not skin:
                continue

            price = offer["p"]
            if price <= 0:
                continue

            market_hash_name = skin["m"]
            market_hash_name = re.sub(r" Doppler ((Phase \d+)|Sapphire|Ruby|Black Pearl|Emerald)", " Doppler", market_hash_name)
            skin = self.parser.get_skin_from_item_name(market_hash_name)
            if skin and (skin.id not in skins or skins[skin.id][1] > price):
                skins[skin.id] = (skin, price)

        for skin, price in skins.values():
            yield skin, price
