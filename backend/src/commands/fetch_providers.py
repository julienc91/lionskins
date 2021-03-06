# -*- coding: utf-8 -*-

import logging
from datetime import datetime
from queue import Queue
from typing import Type

from models import Apps, Providers
from providers import AbstractProvider, TaskTypes, clients
from providers.exceptions import UnfinishedJob


class FetchProviders:
    def __init__(self, provider: Providers, queue: Queue):
        self.provider = provider
        self.queue = queue

    def fetch_provider(self, client: Type[AbstractProvider], app: Apps):
        logging.info("Fetching data from provider {} for app {}".format(client.provider, app))
        client = client(app)

        start_date = datetime.now()
        try:
            for task_type, *args in client.get_tasks():
                self.queue.put((task_type, [app, client.provider, *args]))
        except UnfinishedJob:
            logging.info(f"Fetching interrupted for provider {client.provider}")
            return

        # delete prices that were not updated
        self.queue.put((TaskTypes.REMOVE_PRICES, [app, client.provider, start_date]))

    def run(self):
        for app in Apps:
            for client in clients:
                if self.provider and self.provider != client.provider:
                    continue
                self.fetch_provider(client, app)
