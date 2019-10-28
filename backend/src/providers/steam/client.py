# -*- coding: utf-8 -*-

import re

import requests
from ratelimit import limits, sleep_and_retry

from ...models import Apps, Providers
from ..abstract_provider import AbstractProvider


class Client(AbstractProvider):

    provider = Providers.steam
    base_url = "https://steamcommunity.com/market/search/render/"

    @staticmethod
    def get_parser(app):
        if app == Apps.csgo:
            from ..parsers.csgo import Parser

            return Parser
        raise NotImplementedError

    @sleep_and_retry
    @limits(calls=1, period=45)
    def __get(self, params=None):
        if not params:
            params = {}

        return requests.get(self.base_url, params)

    def _app_specific_parsing(self, skin, row):
        if self.app == Apps.csgo:
            try:
                rarity = row["asset_description"]["type"]
                rarity = re.sub(r"^Souvenir", "", rarity).strip()
                rarity = self.parser.parse_rarity(rarity)
                skin.rarity = rarity
            except (KeyError, AttributeError, ValueError):
                pass

    def get_prices(self):
        start = 0
        count = 100

        while True:
            result = self.__get(
                {
                    "appid": self.parser.app_id,
                    "search_description": 0,
                    "sort_dir": "asc",
                    "sort_column": "name",
                    "norender": 1,
                    "count": count,
                    "currency": 3,
                    "start": start,
                }
            )
            try:
                result = result.json()["results"]
            except (KeyError, TypeError):
                return

            if not result:
                return

            for row in result:
                item_name = row["hash_name"]
                item_price = float(row["sell_price"]) / 100
                skin = self.parser.get_skin_from_item_name(item_name)
                if skin:
                    image_url = row.get("asset_description", {}).get("icon_url", "")
                    if not skin.image_url and image_url:
                        skin.image_url = f"https://steamcommunity-a.akamaihd.net/economy/image/{image_url}/720fx720f"

                    self._app_specific_parsing(skin, row)

                    if item_price > 0:
                        yield skin, item_price

            start += count
