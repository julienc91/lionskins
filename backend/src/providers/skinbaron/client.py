# -*- coding: utf-8 -*-

import logging
import os
import time

import requests
from ratelimit import limits, sleep_and_retry

from ...models import Apps, Providers
from ...models.enums import Currencies
from ...models.csgo import Skin
from ...models.csgo.enums import Qualities, Weapons
from ...utils import CurrencyConverter
from ..abstract_provider import AbstractProvider
from ..exceptions import UnfinishedJob


class Client(AbstractProvider):

    provider = Providers.skinbaron
    base_url = "https://skinbaron.de/api/v2/"

    @staticmethod
    def get_parser(app):
        if app == Apps.csgo:
            from ..parsers.csgo import Parser

            return Parser
        raise NotImplementedError

    @sleep_and_retry
    @limits(calls=1, period=30)
    def __get(self, method, params=None):
        params = params or {}
        cookies = {"AUTHID": os.environ.get("SKINBARON_COOKIE")}
        return requests.get(self.base_url + method, params, cookies=cookies)

    def get_weapon_ids(self):
        res = self.__get("Menu/Load", {"language": "en", "appId": 730})
        res = res.json()

        weapon_ids = {}
        for category in res["nodes"]:
            rows = category["c"]
            for row in rows:
                try:
                    weapon = Weapons(row["lN"])
                except ValueError:
                    continue
                weapon_ids[weapon] = row["vpIds"]
        return weapon_ids

    def get_prices(self):
        unfinished_job = False
        # exception if the cursor is kept open for too long, so we get the ids first, and then we iterate and fetch
        # the Skin object when we need it
        weapon_ids = self.get_weapon_ids()
        skin_ids = [skin.id for skin in Skin.filter()]
        for skin_id in skin_ids:
            skin = Skin.get(id=skin_id)
            weapon_id = weapon_ids[skin.weapon.name]
            params = {"appId": self.parser.app_id, "str": skin.market_hash_name, "sort": "CF", "language": "en", "v": weapon_id}
            if skin.quality == Qualities.vanilla:
                params["unpainted"] = 1
            elif skin.quality:
                params["wf"] = skin.quality.to_int() - 1

            if skin.stat_trak:
                params["statTrak"] = True
            elif skin.souvenir:
                params["souvenir"] = True

            res = self.__get("Browsing/FilterOffers", params)
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
            offers = res["aggregatedMetaOffers"]
            if not offers:
                continue

            for offer in offers:
                if offer["singleOffer"]["localizedName"] not in skin.market_hash_name:
                    continue
                if offer["singleOffer"]["localizedExteriorName"] != skin.quality.value and (
                    skin.quality != Qualities.vanilla or offer["singleOffer"]["localizedExteriorName"] != "Not painted"
                ):
                    continue
                if bool(offer["singleOffer"].get("statTrakString")) != skin.stat_trak:
                    continue
                if bool(offer["singleOffer"].get("souvenirString")) != skin.souvenir:
                    continue

                item_price = offer["singleOffer"]["itemPrice"]
                if item_price > 0:
                    item_price = CurrencyConverter.convert(item_price, Currencies.eur, Currencies.usd)
                    yield skin, item_price
                    break

        if unfinished_job:
            raise UnfinishedJob
