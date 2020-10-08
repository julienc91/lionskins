# -*- coding: utf-8 -*-

import logging
import time

import requests
from ratelimit import limits, sleep_and_retry

from ...models import Apps, Providers
from ...models.enums import Currencies
from ...models.csgo import Skin
from ...models.csgo.enums import Qualities
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
        return requests.get(self.base_url + method, params, headers={"Referer": "https://skinbaron.de/"})

    def get_prices(self):
        unfinished_job = False
        # exception if the cursor is kept open for too long, so we get the ids first, and then we iterate and fetch
        # the Skin object when we need it
        skin_ids = [skin.id for skin in Skin.filter()]
        for skin_id in skin_ids:
            skin = Skin.get(id=skin_id)
            params = {"appId": self.parser.app_id, "str": skin.market_hash_name, "sort": "CF", "language": "en"}
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
