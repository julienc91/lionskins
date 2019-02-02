# -*- coding: utf-8 -*-

import requests
from bs4 import BeautifulSoup

from ...models import Apps, Providers
from ..abstract_provider import AbstractProvider


class Client(AbstractProvider):

    provider = Providers.csgoshop

    @staticmethod
    def get_parser(app):
        if app == Apps.csgo:
            from ..parsers.csgo import Parser
            return Parser
        raise NotImplemented

    def get_prices(self):
        for result in Scraper.run():
            item_name = result['name']
            item_price = result['price']
            skin = self.parser.get_skin_from_item_name(item_name)
            if skin and item_price > 0:
                yield (skin, item_price)


class Scraper:
    base_url = "https://csgoshop.com/?page=1"

    @classmethod
    def run(cls):
        url = cls.base_url
        while url:
            page = cls.get_page(url)
            yield from cls.parse(page)
            url = cls.get_next_page_url(page)

    @staticmethod
    def get_page(url):
        page = requests.get(url)
        return BeautifulSoup(page.text, 'html.parser')

    @staticmethod
    def get_next_page_url(page):
        next_page = page.select_one('main.container .pagination li a[rel="next"]')
        if next_page:
            return next_page['href']
        return None

    @staticmethod
    def parse(page):
        for item in page.select('main.container .listing-item'):
            yield {
                'name': item.select_one('.item-name').getText(),
                'price': float(item.select_one('.item-price')['content']),
            }
