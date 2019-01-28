# -*- coding: utf-8 -*-

import logging

from ..models import Apps
from ..providers import clients


class FetchProviders:

    @classmethod
    def fetch_provider(cls, client, app):
        logging.info("Fetching data from provider {} for app {}".format(client.provider, app))
        client = client(app)

        count = 0
        for count, (skin, price) in enumerate(client.get_prices(), start=1):
            skin.add_price(provider=client.provider, price=price)
            logging.debug("{} - {}: {}".format(client.provider.name, skin.fullname, price))

        logging.info("Fetching finished, created or updated {} skins".format(count))

    @classmethod
    def run(cls, provider=None):
        for app in Apps:
            for client in clients:
                if provider and provider != client.provider:
                    continue
                cls.fetch_provider(client, app)
