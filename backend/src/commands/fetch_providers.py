# -*- coding: utf-8 -*-

import logging
from datetime import datetime

from ..models import Apps, Skin
from ..providers import clients


class FetchProviders:
    @classmethod
    def fetch_provider(cls, client, app):
        logging.info("Fetching data from provider {} for app {}".format(client.provider, app))
        client = client(app)

        count = 0
        start_date = datetime.now()
        for count, (skin, price) in enumerate(client.get_prices(), start=1):
            skin.add_price(provider=client.provider, price=price)
            logging.debug("{} - {}: {}".format(client.provider.name, skin.fullname, price))

        # delete prices that were not updated
        Skin.filter(
            __raw__={"prices": {"$elemMatch": {"provider": client.provider.name, "update_date": {"$lt": start_date}}}}
        ).update(pull__prices___provider=client.provider.name)

        logging.info("Fetching finished for provider {}, created or updated {} skins".format(client.provider, count))

    @classmethod
    def run(cls, provider=None):
        for app in Apps:
            for client in clients:
                if provider and provider != client.provider:
                    continue
                cls.fetch_provider(client, app)
