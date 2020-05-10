# -*- coding: utf-8 -*-

import time
import logging
from queue import Queue
from threading import Thread

import click

from ..application import app
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
            (skin, price, provider) = queue.get()
            skin.add_price(provider=provider, price=price)
            queue.task_done()

    else:
        for provider in providers:
            FetchProviders(provider).run()


@app.cli.command("generate_sitemap")
def generate_sitemap():
    from .generate_sitemap import GenerateSitemap

    GenerateSitemap.run()


@app.cli.command("sync_catalog")
def sync_catalog():
    from .sync_catalog import SyncCatalog

    SyncCatalog.run()
