# -*- coding: utf-8 -*-

import os

import pyotp
import requests
from ratelimit import limits, sleep_and_retry

from models import Apps, Providers
from providers.abstract_provider import AbstractProvider, TaskTypes
from providers.exceptions import UnfinishedJob


class Client(AbstractProvider):

    provider = Providers.bitskins
    base_url = "https://bitskins.com/api/v1/"

    def __init__(self, app):
        super().__init__(app)
        self.__otp = pyotp.TOTP(os.environ.get("BITSKINS_2FA_KEY"))

    @staticmethod
    def get_parser(app):
        if app == Apps.csgo:
            from providers.parsers.csgo import Parser

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
        params["api_key"] = os.environ["BITSKINS_API_KEY"]
        params["code"] = self.__2fa_code

        return requests.get(self.base_url + method + "/", params)

    def get_tasks(self):
        result = self.__get("get_price_data_for_items_on_sale", params={"app_id": 730})
        if result.status_code >= 500:
            raise UnfinishedJob

        result = result.json()["data"]["items"]
        for row in result:
            item_name = row["market_hash_name"]
            item_price = float(row["lowest_price"])
            yield TaskTypes.ADD_PRICE, item_name, item_price, None
