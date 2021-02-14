# -*- coding: utf-8 -*-

import os

import requests
from ratelimit import limits, sleep_and_retry
from src.models import Apps, Providers
from src.models.enums import Currencies
from src.providers.abstract_provider import AbstractProvider
from src.providers.exceptions import UnfinishedJob
from src.utils import CurrencyConverter


class Client(AbstractProvider):

    provider = Providers.skinbaron
    base_url = "https://api.skinbaron.de/"

    @staticmethod
    def get_parser(app):
        if app == Apps.csgo:
            from src.providers.parsers.csgo import Parser

            return Parser
        raise NotImplementedError

    @sleep_and_retry
    @limits(calls=1, period=10)
    def __get(self, method, params=None):
        params = params or {}
        params["apikey"] = os.environ["SKINBARON_API_KEY"]
        params["appId"] = self.parser.app_id
        return requests.post(
            self.base_url + method,
            json=params,
            headers={"Content-Type": "application/json", "X-Requested-With": "XMLHttpRequest"},
        )

    def get_prices(self):
        result = self.__get("GetPriceList")
        if result.status_code >= 500:
            raise UnfinishedJob

        result = result.json()["map"]
        for row in result:
            item_price = float(row["lowestPrice"])
            if item_price <= 0:
                continue

            skin = None
            item_name = row.get("marketHashName")
            if item_name and "StatTrak™ " in item_name and not row.get("statTrak"):
                # fix api inconsistency
                item_name = item_name.replace("StatTrak™ ", "")
            if item_name and "Souvenir " in item_name and not row.get("souvenir"):
                # fix api inconsistency
                item_name = item_name.replace("Souvenir ", "")

            if item_name:
                skin = self.parser.get_skin_from_item_name(item_name)
            if skin and skin.souvenir and not row.get("souvenir"):
                continue
            elif skin and skin.stat_trak and not row.get("statTrak"):
                continue

            if skin:
                item_price = CurrencyConverter.convert(item_price, Currencies.eur, Currencies.usd)
                yield skin, item_price
