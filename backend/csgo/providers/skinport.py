import base64
from decimal import Decimal
from typing import Any

import requests
from django.conf import settings
from ratelimit import limits, sleep_and_retry

from csgo.providers.abstract_client import AbstractClient, UnfinishedJob
from lionskins.models.enums import Currencies, Providers
from lionskins.utils.currency_converter import CurrencyConverter


class SkinportClient(AbstractClient):
    provider = Providers.skinport
    base_url = "https://api.skinport.com/v1/"

    @property
    def token(self) -> str:
        client_id = settings.SKINPORT_CLIENT_ID
        client_secret = settings.SKINPORT_CLIENT_SECRET
        return base64.b64encode(f"{client_id}:{client_secret}".encode()).decode()

    @sleep_and_retry
    @limits(calls=1, period=10)
    def __get(self, method: str, params: Any = None) -> requests.Response:
        params = params or {}
        params["app_id"] = 730
        return requests.get(
            self.base_url + method,
            params=params,
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Basic {self.token}",
            },
        )

    def get_prices(self):
        result = self.__get("items")
        if result.status_code >= 500:
            raise UnfinishedJob

        result = result.json()
        for row in result:
            item_price = Decimal(row.get("min_price") or 0)
            if item_price <= 0:
                continue

            item_name = row.get("market_hash_name")
            item_price = CurrencyConverter.convert(
                item_price, Currencies.eur, Currencies.usd
            )
            yield item_name, item_price, None
