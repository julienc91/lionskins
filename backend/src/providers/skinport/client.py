# -*- coding: utf-8 -*-

import base64
import os

import requests
from ratelimit import limits, sleep_and_retry

from models import Providers
from models.enums import Currencies
from providers.abstract_provider import AbstractProvider, TaskTypes
from providers.exceptions import UnfinishedJob
from utils import CurrencyConverter


class Client(AbstractProvider):
    provider = Providers.skinport
    base_url = "https://api.skinport.com/v1/"

    @property
    def token(self) -> str:
        client_id = os.environ["SKINPORT_CLIENT_ID"]
        client_secret = os.environ["SKINPORT_CLIENT_SECRET"]
        return base64.b64encode(f"{client_id}:{client_secret}".encode()).decode()

    @sleep_and_retry
    @limits(calls=1, period=10)
    def __get(self, method, params=None):
        params = params or {}
        params["app_id"] = 730
        return requests.get(
            self.base_url + method,
            params=params,
            headers={"Content-Type": "application/json", "Authorization": f"Basic {self.token}"},
        )

    def get_tasks(self):
        result = self.__get("items")
        if result.status_code >= 500:
            raise UnfinishedJob

        result = result.json()
        for row in result:
            item_price = float(row.get("min_price") or 0)
            if item_price <= 0:
                continue

            item_name = row.get("market_hash_name")
            item_price = CurrencyConverter.convert(item_price, Currencies.eur, Currencies.usd)
            yield TaskTypes.ADD_PRICE, item_name, item_price, None
