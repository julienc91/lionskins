from datetime import datetime, timedelta
from decimal import Decimal
from threading import Lock

import requests

from lionskins.models.enums import Currencies


class CurrencyConverter:

    __rate = None
    __last_update = None
    __lock = Lock()

    UPDATE_DELAY = timedelta(hours=12)
    ERROR_DELAY = timedelta(minutes=5)

    @classmethod
    def _get_rate(cls, from_currency: Currencies, to_currency: Currencies) -> Decimal:
        if from_currency is to_currency:
            return Decimal(1.0)

        with cls.__lock:
            if (
                not cls.__rate
                or not cls.__last_update
                or (datetime.now() - cls.__last_update) > cls.UPDATE_DELAY
            ):
                cls._update_rate()

            try:
                if from_currency in cls.__rate:
                    return cls.__rate[from_currency][to_currency]
                elif to_currency in cls.__rate:
                    return 1 / cls.__rate[to_currency][from_currency]
            except (KeyError, ValueError, TypeError):
                pass
            return Decimal(1.0)

    @classmethod
    def _update_rate(cls):
        cls.__last_update = datetime.now() - cls.UPDATE_DELAY + cls.ERROR_DELAY
        res = requests.get("https://api.exchangerate.host/latest?base=USD")
        if res.status_code != 200:
            return

        updated_rates = res.json()["rates"]
        cls.__rate = {
            Currencies.usd: {
                Currencies.eur: Decimal(updated_rates["EUR"]),
                Currencies.usd: Decimal(1.0),
            }
        }
        cls.__last_update = datetime.now()

    @classmethod
    def convert(
        cls, amount: Decimal, from_currency: Currencies, to_currency: Currencies
    ) -> Decimal:
        rate = cls._get_rate(from_currency, to_currency)
        return Decimal(round(amount * rate, 2))
