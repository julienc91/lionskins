# -*- coding: utf-8 -*-

import os

import requests
from ratelimit import limits, sleep_and_retry

from models import Providers
from models.enums import Currencies
from providers.abstract_provider import AbstractProvider, TaskTypes
from providers.exceptions import UnfinishedJob
from utils import CurrencyConverter


class Client(AbstractProvider):
    provider = Providers.skinbaron
    base_url = "https://api.skinbaron.de/"

    @sleep_and_retry
    @limits(calls=1, period=10)
    def __get(self, method, params=None):
        params = params or {}
        params["apikey"] = os.environ["SKINBARON_API_KEY"]
        params["appId"] = 730
        return requests.post(
            self.base_url + method,
            json=params,
            headers={"Content-Type": "application/json", "X-Requested-With": "XMLHttpRequest"},
        )

    def get_tasks(self):
        result = self.__get("GetPriceList")
        if result.status_code >= 500:
            raise UnfinishedJob

        result = result.json()["map"]
        for row in result:
            item_price = float(row["lowestPrice"])
            if item_price <= 0:
                continue

            item_name = row.get("marketHashName")
            if item_name and "StatTrak™ " in item_name and not row.get("statTrak"):
                # fix api inconsistency
                item_name = item_name.replace("StatTrak™ ", "")
            if item_name and "Souvenir " in item_name and not row.get("souvenir"):
                # fix api inconsistency
                item_name = item_name.replace("Souvenir ", "")

            item_price = CurrencyConverter.convert(item_price, Currencies.eur, Currencies.usd)
            yield TaskTypes.ADD_PRICE, item_name, item_price, None
