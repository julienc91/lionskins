# -*- coding: utf-8 -*-

import time
import logging
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

        def worker(p):
            while True:
                try:
                    FetchProviders.run(p)
                except Exception as e:
                    logging.exception(e)
                time.sleep(3600)

        threads = [Thread(target=worker, args=(provider,)) for provider in providers]
        for thread in threads:
            thread.start()
        for thread in threads:
            thread.join()

    else:
        for provider in providers:
            FetchProviders.run(provider)


@app.cli.command("generate_sitemap")
def generate_sitemap():
    from .generate_sitemap import GenerateSitemap

    GenerateSitemap.run()


@app.cli.command("sync_catalog")
def sync_catalog():
    from .sync_catalog import SyncCatalog

    SyncCatalog.run()
