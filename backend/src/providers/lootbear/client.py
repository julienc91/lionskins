# -*- coding: utf-8 -*-

import requests
from ratelimit import limits, sleep_and_retry

from ...models import Apps, Providers
from ..abstract_provider import AbstractProvider


class Client(AbstractProvider):

    provider = Providers.lootbear
    base_url = "https://app.lootbear.com/api/lootbear/v1/"

    @staticmethod
    def get_parser(app):
        if app == Apps.csgo:
            from ..parsers.csgo import Parser

            return Parser
        raise NotImplementedError

    @sleep_and_retry
    @limits(calls=1, period=1)
    def __get(self, method, params=None):
        if not params:
            params = {}
        return requests.get(self.base_url + method, params)

    def get_prices(self):
        limit = 100
        offset = 0
        already_done = set()  # some skins are returned multiple times

        while True:
            result = self.__get(
                "items",
                params={"limit": limit, "offset": offset, "renting": 0, "selling": 1, "gameId": "csgo", "sortBy": "price_asc"},
            )
            result = result.json()["items"]
            if not result:
                return

            offset += limit
            for row in result:
                if row["steamAppId"] != self.parser.app_id:
                    continue

                item_name = row["name"]
                item_price = float(row["price"]) / 100.0
                if item_name in already_done:
                    continue

                skin = self.parser.get_skin_from_item_name(item_name)
                if skin and item_price > 0:
                    already_done.add(item_name)
                    yield (skin, item_price)
