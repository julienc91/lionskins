# -*- coding: utf-8 -*-

import re

import requests
import structlog
from ratelimit import limits, sleep_and_retry

from init import cache
from models import Apps, Providers
from providers.abstract_provider import AbstractProvider, TaskTypes
from providers.exceptions import UnfinishedJob
from providers.parsers import get_parser

logger = structlog.get_logger()


class Client(AbstractProvider):
    provider = Providers.steam
    base_url = "https://steamcommunity.com/market/search/render/"

    @sleep_and_retry
    @limits(calls=1, period=45)
    def __get(self, params=None):
        return requests.get(self.base_url, params)

    def _parse_rarity(self, row):
        if self.app == Apps.csgo:
            try:
                rarity = row["asset_description"]["type"]
                rarity = re.sub(r"^Souvenir", "", rarity).strip()
                return get_parser(self.app).parse_rarity(rarity)
            except (KeyError, AttributeError, ValueError):
                pass
        return None

    def get_tasks(self):
        start = 0
        count = 100
        unfinished_job = False

        while True:
            params = {
                "appid": 730,
                "search_description": 0,
                "sort_dir": "asc",
                "sort_column": "name",
                "norender": 1,
                "count": count,
                "currency": 3,
                "start": start,
            }
            result = self.__get(params)
            if result.status_code >= 500:
                unfinished_job = True
                logger.warning(
                    f"Unexpected response from {self.provider}:\n"
                    f"* params: {params}\n"
                    f"* status: {result.status_code}\n"
                    f"* response: {result.content}"
                )
                continue
            if result.status_code >= 400:
                logger.exception(
                    f"Unexpected response from {self.provider}:\n"
                    f"* params: {params}\n"
                    f"* status: {result.status_code}\n"
                    f"* response: {result.content}"
                )
                unfinished_job = True
                continue

            data = result.json()["results"]
            if not data:
                logger.warning(
                    f"Unexpected response from {self.provider}:\n"
                    f"* params: {params}\n"
                    f"* status: {result.status_code}\n"
                    f"* response: {result.content}"
                )
                raise UnfinishedJob

            for row in data:
                item_name = row["hash_name"]
                item_price = float(row["sell_price"]) / 100

                kwargs = {}

                image_id = row.get("asset_description", {}).get("icon_url", "")
                if image_id:
                    kwargs["image_url"] = f"https://steamcommunity-a.akamaihd.net/economy/image/{image_id}/720fx720f"

                rarity = self._parse_rarity(row)
                if rarity:
                    kwargs["rarity"] = rarity

                yield TaskTypes.ADD_PRICE, item_name, item_price, kwargs

            start += count
            if unfinished_job:
                raise UnfinishedJob

            if len(data) < count:
                return

    @cache.memoize()
    def get_inventory(self, steam_id):
        return requests.get(f"https://steamcommunity.com/inventory/{steam_id}/730/2", params={"l": "english", "count": 5000})
