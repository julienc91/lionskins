# -*- coding: utf-8 -*-

import logging
from datetime import datetime

from ..models import Apps, Skin
from ..providers import clients
from ..providers.exceptions import UnfinishedJob


class FetchProviders:
    @classmethod
    def fetch_provider(cls, client, app):
        logging.getLogger().setLevel(logging.DEBUG)
        logging.info("Fetching data from provider {} for app {}".format(client.provider, app))
        client = client(app)

        count = 0
        start_date = datetime.now()
        try:
            for count, (skin, price) in enumerate(client.get_prices(), start=1):
                skin.add_price(provider=client.provider, price=price)
                logging.debug("{} - {}: {}".format(client.provider.name, skin.fullname, price))
        except UnfinishedJob:
            logging.info(f"Fetching interrupted for provider {client.provider}, created or updated {count} skins")
            return

        # delete prices that were not updated
        Skin.filter(
            __raw__={"prices": {"$elemMatch": {"provider": client.provider.name, "update_date": {"$lt": start_date}}}}
        ).update(pull__prices___provider=client.provider.name)

        logging.info(f"Fetching finished for provider {client.provider}, created or updated {count} skins")

    @classmethod
    def run(cls, provider=None):
        for app in Apps:
            for client in clients:
                if provider and provider != client.provider:
                    continue
                cls.fetch_provider(client, app)
