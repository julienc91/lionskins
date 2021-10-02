# -*- coding: utf-8 -*-

import re
import time

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

    def _get_market_listings_with_retry(self, params):
        max_retries = 3
        retry = 0
        while retry < max_retries:
            result = self.__get(params)
            if result.status_code >= 500:
                retry += 1
                time.sleep(120)
                continue
            elif result.status_code >= 400:
                logger.exception(
                    "Unexpected response",
                    provider=self.provider,
                    params=params,
                    status_code=result.status_code,
                    response=result.content,
                )
                raise UnfinishedJob

            data = result.json()["results"]
            if not data:
                retry += 1
                time.sleep(300)
                continue

            return data

        logger.warning("Could not list market listings despite retries", provider=self.provider, params=params)
        raise UnfinishedJob

    def get_tasks(self):
        start = 0
        count = 100

        while True:
            params = {
                "appid": self._steam_app_id,
                "search_description": 0,
                "sort_dir": "asc",
                "sort_column": "name",
                "norender": 1,
                "count": count,
                "currency": 3,
                "start": start,
                "query": "Music Kit",
            }
            data = self._get_market_listings_with_retry(params)

            for row in data:
                item_name = row["hash_name"]
                item_price = float(row["sell_price"]) / 100

                kwargs = {}

                image_id = row.get("asset_description", {}).get("icon_url", "")
                if image_id:
                    if "Music Kit |" in item_name:
                        dimensions = "360fx360f"
                    elif "Sealed Graffiti |" in item_name:
                        dimensions = "300fx300f"
                    else:
                        dimensions = "720fx720f"
                    kwargs["image_url"] = f"https://steamcommunity-a.akamaihd.net/economy/image/{image_id}/{dimensions}"

                rarity = self._parse_rarity(row)
                if rarity:
                    kwargs["rarity"] = rarity

                yield TaskTypes.ADD_PRICE, item_name, item_price, kwargs

            start += count
            if len(data) < count:
                return

    @cache.memoize()
    def get_inventory(self, steam_id: str):
        return requests.get(f"https://steamcommunity.com/inventory/{steam_id}/730/2", params={"l": "english", "count": 5000})
