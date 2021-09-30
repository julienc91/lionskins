# -*- coding: utf-8 -*-

import time
from datetime import datetime
from queue import Queue
from threading import Thread
from typing import Optional

import structlog

from models import Apps, Providers, Skin
from providers import TaskTypes, clients
from providers.exceptions import UnfinishedJob
from providers.parsers import get_parser

logger = structlog.get_logger()


class FetchProviders:
    def __init__(self, daemon: bool = False, provider: Optional[Providers] = None):
        self.queue = Queue()
        self.daemon = daemon
        self.providers = [Providers[provider]] if provider else list(Providers)

    def _fetch_provider(self, provider: Providers):
        app = Apps.csgo
        client_class = next(client for client in clients if client.provider == provider)

        while True:
            try:
                logger.info("Fetching data", provider=provider, app=app)
                client = client_class(app)

                start_date = datetime.now()
                try:
                    for task_type, *args in client.get_tasks():
                        self.queue.put((task_type, [app, provider, *args]))
                except UnfinishedJob:
                    logger.warning("Fetching interrupted", provider=provider, app=app)
                    return

                # delete prices that were not updated
                self.queue.put((TaskTypes.REMOVE_PRICES, [app, client.provider, start_date]))

            except Exception as e:
                logger.exception(e)

            self.queue.put((TaskTypes.LAST_TASK, provider))
            if not self.daemon:
                return

            time.sleep(3600)

    def run(self):
        active_workers = 0

        for provider in self.providers:
            active_workers += 1
            thread = Thread(target=self._fetch_provider, args=(provider,))
            thread.start()

        while self.daemon or active_workers > 0:
            task_type, args = self.queue.get()
            if task_type == TaskTypes.ADD_PRICE:
                app_, provider, item_name, price, kwargs = args
                if price > 0:
                    skin = get_parser(app_).get_or_create_skin_from_item_name(item_name)
                    if skin:
                        skin.add_price(provider=provider, price=price)
                        kwargs = kwargs or {}
                        kwargs = {key: value for key, value in kwargs.items() if getattr(skin, key) != value}
                        if kwargs:
                            for key, value in kwargs.items():
                                setattr(skin, key, value)
                            skin.save()

            elif task_type == TaskTypes.REMOVE_PRICES:
                app_, provider, start_date = args
                for skin in Skin.objects(app=app_):
                    updated_prices = []
                    for price in skin.prices:
                        if price.provider.name == provider.name and price.update_date < start_date:
                            continue
                        updated_prices.append(price)

                    if len(updated_prices) != len(skin.prices):
                        skin.prices = updated_prices
                        skin.save()

            elif task_type == TaskTypes.LAST_TASK:
                provider = args
                active_workers -= 1
                logger.info("Last task received", provider=provider)

            self.queue.task_done()
