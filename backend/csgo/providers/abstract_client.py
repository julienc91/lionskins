from csgo.providers.parser import Parser
from lionskins.models.enums import Providers


class UnfinishedJob(Exception):
    pass


class AbstractClient:
    parser = Parser
    provider: Providers

    def get_prices(self):
        raise NotImplementedError()
