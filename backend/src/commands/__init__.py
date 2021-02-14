# -*- coding: utf-8 -*-

import logging
import time
from datetime import datetime
from queue import Queue
from threading import Thread
from typing import Optional

import click
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from apscheduler.triggers.interval import IntervalTrigger
from src.application import app
from src.commands.fetch_players import FetchPlayers
from src.commands.fetch_providers import FetchProviders
from src.commands.generate_sitemap import GenerateSitemap
from src.commands.sanity_check import SanityCheck
from src.commands.sync_catalog import SyncCatalog
from src.models import Skin
from src.models.enums import Providers


@app.cli.command("backoffice")
def backoffice():
    scheduler = BackgroundScheduler()
    scheduler.add_job(GenerateSitemap.run, IntervalTrigger(hours=12), id="sitemap", next_run_time=datetime.now())
    scheduler.add_job(FetchPlayers.run, CronTrigger.from_crontab("0 20 * * 1"), id="players", next_run_time=datetime.now())

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
                for skin in Skin.objects:
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
    GenerateSitemap.run()


@app.cli.command("sanity_check")
def sanity_check():
    SanityCheck.run()


@app.cli.command("sync_catalog")
@click.argument("path")
def sync_catalog(path: str):
    SyncCatalog.run(path)
