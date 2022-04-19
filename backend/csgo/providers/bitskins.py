import pyotp
import requests
from django.conf import settings
from ratelimit import limits, sleep_and_retry

from csgo.providers.abstract_client import AbstractClient, UnfinishedJob
from lionskins.models.enums import Providers


class BitSkinsClient(AbstractClient):

    provider = Providers.bitskins
    base_url = "https://bitskins.com/api/v1/"

    def __init__(self):
        super().__init__()
        self.__otp = pyotp.TOTP(settings.BITSKINS_2FA_KEY)

    @property
    def __2fa_code(self):
        return self.__otp.now()

    @sleep_and_retry
    @limits(calls=5, period=1)
    def __get(self, method, params=None):
        if not params:
            params = {}
        params["api_key"] = settings.BITSKINS_API_KEY
        params["code"] = self.__2fa_code

        return requests.get(self.base_url + method + "/", params)

    def get_prices(self):
        result = self.__get("get_price_data_for_items_on_sale", params={"app_id": 730})
        if result.status_code >= 500:
            raise UnfinishedJob

        result = result.json()["data"]["items"]
        for row in result:
            item_name = row["market_hash_name"]
            item_price = float(row["lowest_price"])
            yield item_name, item_price, None
