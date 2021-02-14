# -*- coding: utf-8 -*-

import logging
from datetime import datetime
from queue import Queue
from typing import Optional

from models import Apps, Providers
from providers import clients
from providers.exceptions import UnfinishedJob


class FetchProviders:
    def __init__(self, provider: Providers, queue: Optional[Queue] = None):
        self.provider = provider
        self.queue = queue

    def fetch_provider(self, client, app: Apps):
        logging.info("Fetching data from provider {} for app {}".format(client.provider, app))
        client = client(app)

        count = 0
        start_date = datetime.now()
        try:
            for count, (skin, price) in enumerate(client.get_prices(), start=1):
                # when the command is run in daemon mode, there may be concurrency issues
                # the queue is here for the database update to take place in a single thread
                if self.queue:
                    self.queue.put(("add", [skin.id, price, client.provider]))
                else:
                    skin.add_price(provider=client.provider, price=price)
                logging.debug("{} - {}: {}".format(client.provider.name, skin.fullname, price))
        except UnfinishedJob:
            logging.info(f"Fetching interrupted for provider {client.provider}, created or updated {count} skins")
            return

        # delete prices that were not updated
        if self.queue:
            self.queue.put(("remove", [start_date, client.provider]))

        logging.info(f"Fetching finished for provider {client.provider}, created or updated {count} skins")

    def run(self):
        for app in Apps:
            for client in clients:
                if self.provider and self.provider != client.provider:
                    continue
                self.fetch_provider(client, app)
