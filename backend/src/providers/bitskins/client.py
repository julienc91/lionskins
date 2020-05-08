# -*- coding: utf-8 -*-

import os

import pyotp
import requests
from ratelimit import limits, sleep_and_retry

from ...models import Apps, Providers
from ..abstract_provider import AbstractProvider


class Client(AbstractProvider):

    provider = Providers.bitskins
    base_url = "https://bitskins.com/api/v1/"

    def __init__(self, app):
        super().__init__(app)
        self.__otp = pyotp.TOTP(os.environ.get("BITSKINS_2FA_KEY"))

    @staticmethod
    def get_parser(app):
        if app == Apps.csgo:
            from ..parsers.csgo import Parser

            return Parser
        raise NotImplementedError

    @property
    def __2fa_code(self):
        return self.__otp.now()

    @sleep_and_retry
    @limits(calls=5, period=1)
    def __get(self, method, params=None):
        if not params:
            params = {}
        params["api_key"] = os.environ.get("BITSKINS_API_KEY")
        params["code"] = self.__2fa_code

        return requests.get(self.base_url + method + "/", params)

    def get_prices(self):
        result = self.__get("get_price_data_for_items_on_sale", params={"app_id": self.parser.app_id})
        if result.status_code >= 500:
            return

        result = result.json()["data"]["items"]
        for row in result:
            item_name = row["market_hash_name"]
            item_price = float(row["lowest_price"])
            skin = self.parser.get_skin_from_item_name(item_name)
            if skin and item_price > 0:
                yield skin, item_price
