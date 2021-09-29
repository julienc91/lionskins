# -*- coding: utf-8 -*-

from abc import abstractmethod
from enum import Enum


class TaskTypes(Enum):
    ADD_PRICE = "add_price"
    REMOVE_PRICES = "remove_prices"
    LAST_TASK = "last_task"


class AbstractProvider:
    def __init__(self, app):
        self.app = app

    @property
    @abstractmethod
    def provider(self):
        pass

    @abstractmethod
    def get_tasks(self):
        raise NotImplementedError

    def __repr__(self):
        return f"<{self.__class__.__name__} - {self.app}>"
