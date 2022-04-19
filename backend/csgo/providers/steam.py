import re
import time

import requests
import structlog
from django.core.cache import cache
from ratelimit import limits, sleep_and_retry

from csgo.providers.abstract_client import AbstractClient, UnfinishedJob
from lionskins.models.enums import Providers

logger = structlog.get_logger()


class SteamClient(AbstractClient):
    base_url = "https://steamcommunity.com/market/search/render/"
    provider = Providers.steam

    @sleep_and_retry
    @limits(calls=1, period=45)
    def __get(self, params=None):
        return requests.get(self.base_url, params)

    def _parse_rarity(self, row):
        try:
            rarity = row["asset_description"]["type"]
            rarity = re.sub(r"^Souvenir", "", rarity).strip()
            return self.parser.parse_rarity(rarity)
        except (KeyError, AttributeError, ValueError):
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

    def get_prices(self):
        start = 0
        count = 100

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
            data = self._get_market_listings_with_retry(params)

            for row in data:
                item_name = row["hash_name"]
                item_price = float(row["sell_price"]) / 100

                kwargs = {}

                image_id = row.get("asset_description", {}).get("icon_url", "")
                if image_id:
                    if "Music Kit |" in item_name or "Patch | " in item_name:
                        dimensions = "360fx360f"
                    elif "Sealed Graffiti |" in item_name or "Sticker |" in item_name:
                        dimensions = "300fx300f"
                    else:
                        dimensions = "720fx720f"
                    kwargs["image_url"] = f"https://steamcommunity-a.akamaihd.net/economy/image/{image_id}/{dimensions}"

                rarity = self._parse_rarity(row)
                if rarity:
                    kwargs["rarity"] = rarity

                yield item_name, item_price, kwargs

            start += count
            if len(data) < count:
                return


def get_inventory(steam_id: str):
    cache_key = f"steam_inventory_{steam_id}"
    inventory = cache.get(cache_key)
    if inventory is None:
        res = requests.get(f"https://steamcommunity.com/inventory/{steam_id}/730/2", params={"l": "english", "count": 5000})
        if res.status_code != 200:
            return None

        inventory = res.json()
        cache.set(cache_key, inventory)
    return inventory
