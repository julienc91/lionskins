from decimal import Decimal

from django.db import models
from django.utils import timezone

from lionskins.models.enums import Currencies, Providers
from lionskins.utils.currency_converter import CurrencyConverter


class Price(models.Model):
    skin = models.ForeignKey("csgo.Skin", on_delete=models.CASCADE, related_name="prices")
    provider = models.CharField(max_length=32, db_index=True, choices=Providers.choices)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    creation_date = models.DateTimeField(default=timezone.now)
    update_date = models.DateTimeField(default=timezone.now)

    class Meta:
        constraints = [models.UniqueConstraint(fields=["skin", "provider"], name="unique_price_per_provider")]

    def convert(self, currency: Currencies) -> Decimal:
        if currency == Currencies.usd:
            return self.price

        return CurrencyConverter.convert(self.price, Currencies.usd, currency)
