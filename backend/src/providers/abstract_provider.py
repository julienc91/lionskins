# -*- coding: utf-8 -*-

from abc import abstractmethod


class AbstractProvider:
    def __init__(self, app):
        self.app = app
        self.parser = self.get_parser(app)

    @staticmethod
    @abstractmethod
    def get_parser(app):
        pass

    @property
    @abstractmethod
    def provider(self):
        pass

    @abstractmethod
    def get_prices(self):
        pass
