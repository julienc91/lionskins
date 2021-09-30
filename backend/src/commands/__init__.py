# -*- coding: utf-8 -*-

from typing import Optional

import click
import structlog
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger

from application import app
from commands.fetch_players import FetchPlayers
from commands.fetch_providers import FetchProviders
from commands.generate_sitemap import GenerateSitemap
from commands.sanity_check import SanityCheck
from commands.sync_catalog import SyncCatalog
from models.enums import Providers

logger = structlog.get_logger()


@app.cli.command("backoffice")
def backoffice():
    scheduler = BackgroundScheduler()
    scheduler.add_job(GenerateSitemap.run, CronTrigger.from_crontab("0 */12 * * *"), id="sitemap")
    scheduler.add_job(FetchPlayers.run, CronTrigger.from_crontab("0 20 * * *"), id="players")

    scheduler.start()
    FetchProviders(True).run()


@app.cli.command("fetch_players")
def fetch_players():
    return FetchPlayers.run()


@app.cli.command("fetch_providers")
@click.option("--daemon", is_flag=True)
@click.option("--provider", type=click.Choice([p.name for p in Providers]))
def fetch_providers(daemon: bool, provider: Optional[Providers]):
    return FetchProviders(daemon, provider).run()


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
