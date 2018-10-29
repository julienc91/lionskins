# -*- coding: utf-8 -*-

import logging
from datetime import datetime

from ..init import sqlalchemy as db
from ..providers import providers
from ..models import Price, Apps


class FetchProviders:

    @classmethod
    def fetch_provider(cls, provider_name, app):
        logging.info("Fetching data from provider {} for app {}".format(provider_name, app))
        provider, client = providers[provider_name]
        client = client(app)

        count = 0
        for count, (skin, price) in enumerate(client.get_prices()):
            Price.create_or_update(skin=skin, provider=provider,
                                   data={'creation_date': datetime.now(), 'price': price})
            logging.debug("{} - {}: {}".format(provider.name.value, skin.fullname, price))

        logging.info("Fetching finished, created or updated {} skins".format(count))
        db.session.commit()

    @classmethod
    def run(cls, provider=None):
        for app in Apps:
            for provider_name in providers:
                if provider and provider != provider_name:
                    continue
                cls.fetch_provider(provider_name, app)
