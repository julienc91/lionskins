# -*- coding: utf-8 -*-

import time
from queue import Queue
from threading import Thread
from typing import Optional

import click
import structlog
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger

from application import app
from commands.fetch_players import FetchPlayers
from commands.fetch_providers import FetchProviders, TaskTypes
from commands.generate_sitemap import GenerateSitemap
from commands.sanity_check import SanityCheck
from commands.sync_catalog import SyncCatalog
from models import Skin
from models.enums import Providers
from providers.parsers import get_parser

logger = structlog.get_logger()


@app.cli.command("backoffice")
def backoffice():
    scheduler = BackgroundScheduler()
    scheduler.add_job(GenerateSitemap.run, CronTrigger.from_crontab("0 */12 * * *"), id="sitemap")
    scheduler.add_job(FetchPlayers.run, CronTrigger.from_crontab("0 20 * * *"), id="players")

    scheduler.start()
    _fetch_providers(True, None)


@app.cli.command("fetch_players")
def fetch_players():
    return FetchPlayers.run()


@app.cli.command("fetch_providers")
@click.option("--daemon", is_flag=True)
@click.option("--provider", type=click.Choice([p.name for p in Providers]))
def fetch_providers(daemon: bool, provider: Providers):
    return _fetch_providers(daemon, provider)


def _fetch_providers(daemon: bool, provider: Optional[Providers] = None):
    providers = [Providers[provider]] if provider else list(Providers)

    queue = Queue()
    remaining_workers = 0

    def worker(p):
        while True:
            try:
                FetchProviders(p, queue).run()
            except Exception as e:
                logger.exception(e)
            queue.put((TaskTypes.LAST_TASK, p))
            if not daemon:
                return
            time.sleep(3600)

    for provider in providers:
        remaining_workers += 1
        thread = Thread(target=worker, args=(provider,))
        thread.start()

    # process all the price updates in the main thread, to avoid concurrency issues
    while daemon or remaining_workers > 0:
        task_type, args = queue.get()
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
            remaining_workers -= 1
            logger.info(f"Received last task for provider {provider}")

        queue.task_done()


@app.cli.command("generate_sitemap")
def generate_sitemap():
    GenerateSitemap.run()


@app.cli.command("sanity_check")
def sanity_check():
    SanityCheck.run()


@app.cli.command("sync_catalog")
@click.argument("path")
def sync_catalog(path: str):
    SyncCatalog.run(path)
