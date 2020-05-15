# -*- coding: utf-8 -*-

import time
import logging
from queue import Queue
from threading import Thread

import click

from ..application import app
from ..models import Skin
from ..models.enums import Providers


@app.cli.command("fetch_providers")
@click.option("--daemon", is_flag=True)
@click.option("--provider", type=click.Choice([p.name for p in Providers]))
def fetch_providers(daemon, provider):
    from .fetch_providers import FetchProviders

    if provider:
        providers = [Providers[provider]]
    else:
        providers = [p for p in Providers]

    if daemon:
        queue = Queue()

        def worker(p):
            while True:
                try:
                    FetchProviders(p, queue).run()
                except Exception as e:
                    logging.exception(e)
                time.sleep(3600)

        for provider in providers:
            thread = Thread(target=worker, args=(provider,))
            thread.start()

        # process all the price updates in the main thread, to avoid concurrency issues
        while True:
            (task_type, args) = queue.get()
            if task_type == "add":
                skin_id, price, provider = args
                skin = Skin.get(id=skin_id)
                skin.add_price(provider=provider, price=price)
            elif task_type == "remove":
                start_date, provider = args
                for skin in Skin.filter():
                    updated_prices = []
                    for price in skin.prices:
                        if price.provider.name == provider.name and price.update_date < start_date:
                            continue
                        updated_prices.append(price)

                    if len(updated_prices) != len(skin.prices):
                        skin.prices = updated_prices
                        skin.save()

            queue.task_done()

    else:
        for provider in providers:
            FetchProviders(provider).run()


@app.cli.command("generate_sitemap")
def generate_sitemap():
    from .generate_sitemap import GenerateSitemap

    GenerateSitemap.run()


@app.cli.command("sync_catalog")
@click.argument("path")
def sync_catalog(path):
    from .sync_catalog import SyncCatalog

    SyncCatalog.run(path)


@app.cli.command("sanity_check")
def sanity_check():
    from .sanity_check import SanityCheck

    SanityCheck.run()
