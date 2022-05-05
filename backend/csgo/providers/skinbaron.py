from decimal import Decimal

import requests
from django.conf import settings
from ratelimit import limits, sleep_and_retry

from csgo.providers.abstract_client import AbstractClient, UnfinishedJob
from lionskins.models.enums import Currencies, Providers
from lionskins.utils.currency_converter import CurrencyConverter


class SkinBaronClient(AbstractClient):
    provider = Providers.skinbaron
    base_url = "https://api.skinbaron.de/"

    @sleep_and_retry
    @limits(calls=1, period=10)
    def __get(self, method, params=None):
        params = params or {}
        params["apikey"] = settings.SKINBARON_API_KEY
        params["appId"] = 730
        return requests.post(
            self.base_url + method,
            json=params,
            headers={
                "Content-Type": "application/json",
                "X-Requested-With": "XMLHttpRequest",
            },
        )

    def get_prices(self):
        result = self.__get("GetPriceList")
        if result.status_code >= 500:
            raise UnfinishedJob

        result = result.json()["map"]
        for row in result:
            item_price = Decimal(row["lowestPrice"])
            if item_price <= 0:
                continue

            item_name = row.get("marketHashName")
            if item_name and "StatTrak™ " in item_name and not row.get("statTrak"):
                # fix api inconsistency
                item_name = item_name.replace("StatTrak™ ", "")
            if item_name and "Souvenir " in item_name and not row.get("souvenir"):
                # fix api inconsistency
                item_name = item_name.replace("Souvenir ", "")

            item_price = CurrencyConverter.convert(
                item_price, Currencies.eur, Currencies.usd
            )
            yield item_name, item_price, None


client = SkinBaronClient()
