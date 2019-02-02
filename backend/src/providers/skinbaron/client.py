# -*- coding: utf-8 -*-

import os

import requests
from ratelimit import limits, sleep_and_retry

from ...models import Apps, Providers
from ...models.csgo.enums import Weapons
from ..abstract_provider import AbstractProvider


class Client(AbstractProvider):

    provider = Providers.skinbaron
    base_url = "https://api.skinbaron.de/"

    @staticmethod
    def get_parser(app):
        if app == Apps.csgo:
            from ..parsers.csgo import Parser
            return Parser
        raise NotImplemented

    @sleep_and_retry
    @limits(calls=1, period=5)
    def __get(self, method, params=None):
        if not params:
            params = {}
        params['apikey'] = os.environ.get('SKINBARON_API_KEY')
        return requests.post(self.base_url + method, json=params, headers={
            "X-REQUESTED-WITH": "XMLHttpRequest",
        })

    def get_prices(self):

        for weapon in Weapons:

            prices = {}
            result = self.__get('Search', params={
                'appid': self.parser.app_id,
                'search_item': weapon.value,
            })
            result = result.json()['sales']
            if not result:
                continue

            for row in result:
                if row['appid'] != self.parser.app_id:
                    continue

                item_name = row['market_name']
                item_price = row['price']
                if item_price <= 0:
                    continue

                if item_name not in prices:
                    prices[item_name] = item_price
                prices[item_name] = min(item_price, prices[item_name])

            for item_name, item_price in prices.items():
                skin = self.parser.get_skin_from_item_name(item_name)
                if skin and item_price > 0:
                    yield (skin, item_price)
