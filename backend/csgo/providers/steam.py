import re
import time
from functools import lru_cache

import requests
import structlog
from ratelimit import limits, sleep_and_retry

from csgo.providers.abstract_client import AbstractClient, UnfinishedJob
from lionskins.models.enums import Providers

logger = structlog.get_logger()


class SteamClient(AbstractClient):
    base_url = "https://steamcommunity.com"
    provider = Providers.steam

    @sleep_and_retry
    @limits(calls=1, period=45)
    def get(self, endpoint, params=None):
        return requests.get(self.base_url + endpoint, params)

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
            result = self.get("/market/search/render", params)
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

        logger.warning(
            "Could not list market listings despite retries",
            provider=self.provider,
            params=params,
        )
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
                    kwargs[
                        "image_url"
                    ] = f"https://steamcommunity-a.akamaihd.net/economy/image/{image_id}/{dimensions}"

                rarity = self._parse_rarity(row)
                if rarity:
                    kwargs["rarity"] = rarity

                yield item_name, item_price, kwargs

            start += count
            if len(data) < count:
                return

    def get_inventory(self, steam_id: str) -> tuple[list | None, bool]:
        inventory = []
        params = {"l": "english", "count": 5000}
        while True:
            res = self.get(f"/inventory/{steam_id}/730/2", params=params)
            if res.status_code != 200:
                return None, False

            data = res.json()
            inventory += data.get("descriptions") or []
            if not data.get("more_items") or not data.get("last_assetid"):
                break

            params["start_assetid"] = data["last_assetid"]

        return inventory, True

    @lru_cache(maxsize=1000)
    def confirm_skin_exists(self, item_id: str) -> bool:
        res = self.get(
            "/market/priceoverview/", {"appid": 730, "market_hash_name": item_id}
        )
        return res.status_code == 200


client = SteamClient()
