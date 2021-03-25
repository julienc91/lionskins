# -*- coding: utf-8 -*-

import json
import re

import requests
from ratelimit import limits, sleep_and_retry

from models import Providers
from providers.abstract_provider import AbstractProvider, TaskTypes
from providers.exceptions import UnfinishedJob


class Client(AbstractProvider):
    provider = Providers.csmoney
    base_url = "https://old.cs.money/"

    @sleep_and_retry
    @limits(calls=5, period=1)
    def __get(self, method, params=None):
        return requests.get(self.base_url + method, params)

    def get_tasks(self):
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

            item_price = offer["p"]
            if item_price <= 0:
                continue

            item_name = skin["m"]
            item_name = re.sub(r" Doppler ((Phase \d+)|Sapphire|Ruby|Black Pearl|Emerald)", " Doppler", item_name)
            if item_name not in skins or skins[item_name] > item_price:
                skins[item_name] = item_price

        for item_name, item_price in skins.items():
            yield TaskTypes.ADD_PRICE, item_name, item_price, None
