# -*- coding: utf-8 -*-

import logging
import time

import requests
from ratelimit import limits, sleep_and_retry

from ...models import Apps, Providers
from ...models.csgo import Skin
from ...models.csgo.enums import Qualities
from ..abstract_provider import AbstractProvider
from ..exceptions import UnfinishedJob


class Client(AbstractProvider):
    provider = Providers.csmoney
    base_url = "https://inventories.cs.money/4.0/load_bots_inventory/730"

    @staticmethod
    def get_parser(app):
        if app == Apps.csgo:
            from ..parsers.csgo import Parser

            return Parser
        raise NotImplementedError

    @sleep_and_retry
    @limits(calls=1, period=10)
    def __get(self, params=None):
        if not params:
            params = {}
        return requests.get(self.base_url, params)

    @staticmethod
    def convert_quality(quality: Qualities) -> str:
        if quality is Qualities.factory_new:
            return "fn"
        elif quality is Qualities.minimal_wear:
            return "mw"
        elif quality is Qualities.field_tested:
            return "ft"
        elif quality is Qualities.well_worn:
            return "ww"
        elif quality is Qualities.battle_scarred:
            return "bs"

    def get_prices(self):
        unfinished_job = False
        skin_ids = [skin.id for skin in Skin.filter()]
        for skin_id in skin_ids:
            skin = Skin.get(id=skin_id)
            params = {"hasTradeLock": False, "isStore": True, "limit": 10, "offset": 0, "order": "asc", "sort": "price"}
            quality = self.convert_quality(skin.quality)
            if skin.quality is not Qualities.vanilla:
                params["quality"] = quality
            else:
                # new api not considering vanilla skins for now?
                continue
            params["isStatTrak"] = skin.stat_trak
            params["isSouvenir"] = skin.souvenir
            params["name"] = f"{skin.weapon.name.value} {skin.name}"

            res = self.__get(params)
            if res.status_code >= 500:
                unfinished_job = True
                continue
            if res.status_code == 429:
                unfinished_job = True
                time.sleep(300)
                continue
            if res.status_code >= 400:
                logging.exception(
                    f"Unexpected response from {self.provider}:\n"
                    f"* params: {params}\n"
                    f"* status: {res.status_code}\n"
                    f"* response: {res.content}"
                )
                unfinished_job = True
                continue

            res = res.json()
            offers = res.get("items")
            if not offers:
                continue

            for offer in offers:
                if bool(offer.get("isStatTrak")) != skin.stat_trak:
                    continue
                if bool(offer.get("isSouvenir")) != skin.souvenir:
                    continue
                if offer["quality"] != quality:
                    continue

                price = round(offer["price"] * 0.8, 2)
                yield skin, price
                break

        if unfinished_job:
            raise UnfinishedJob
