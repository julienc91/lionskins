# -*- coding: utf-8 -*-

from abc import abstractmethod
from enum import Enum

from models import Apps


class TaskTypes(Enum):
    ADD_PRICE = "add_price"
    REMOVE_PRICES = "remove_prices"
    LAST_TASK = "last_task"


class AbstractProvider:
    def __init__(self, app: Apps):
        self.app = app

    @property
    def _steam_app_id(self):
        if self.app == Apps.csgo:
            return 730
        raise ValueError(f"No steam id for app {self.app}")

    @property
    @abstractmethod
    def provider(self):
        pass

    @abstractmethod
    def get_tasks(self):
        raise NotImplementedError

    def __repr__(self):
        return f"<{self.__class__.__name__} - {self.app}>"
