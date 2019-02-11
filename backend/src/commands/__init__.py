# -*- coding: utf-8 -*-

import time
import logging

import click

from ..application import app
from ..models.enums import Providers


@app.cli.command('fetch_providers')
@click.option('--daemon', is_flag=True)
@click.option('--provider', type=click.Choice([p.name for p in Providers]))
def fetch_providers(daemon, provider):
    from .fetch_providers import FetchProviders

    if provider:
        provider = Providers[provider]

    if daemon:
        while True:
            try:
                FetchProviders.run(provider)
            except Exception as e:
                logging.exception(e)
            time.sleep(3600)
    else:
        FetchProviders.run(provider)


@app.cli.command('generate_sitemap')
def generate_sitemap():
    from .generate_sitemap import GenerateSitemap
    GenerateSitemap.run()
