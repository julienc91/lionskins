# -*- coding: utf-8 -*-

from unittest.mock import MagicMock

import pytest
from src.models.enums import Currencies
from src.utils import CurrencyConverter

test_rates = {"GBP": 0.7730008525, "EUR": 0.852514919}

EPSILON = 10e-8


@pytest.fixture(autouse=True)
def patch_rate(monkeypatch):
    monkeypatch.setattr(
        "requests.get",
        lambda _: MagicMock(status_code=200, json=lambda: {"rates": test_rates, "base": "USD", "date": "2020-10-02"}),
    )


@pytest.mark.parametrize(
    "value, from_currency, to_currency, expected",
    [
        (2.34, Currencies.usd, Currencies.eur, 2.34 * test_rates["EUR"]),
        (3.24, Currencies.usd, Currencies.usd, 3.24),
        (3.42, Currencies.eur, Currencies.eur, 3.42),
        (4.23, Currencies.eur, Currencies.usd, 4.23 * 1 / test_rates["EUR"]),
    ],
)
def test_convert(value, from_currency, to_currency, expected):
    res = CurrencyConverter.convert(value, from_currency, to_currency)
    assert abs(res - round(expected, 2)) < EPSILON
