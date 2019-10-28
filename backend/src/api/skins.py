# -*- coding: utf-8 -*-

import graphene

from .. import models
from ..utils import CurrencyConverter


class TypeProvider(graphene.Enum):
    class Meta:
        enum = models.enums.Providers


class TypeCurrency(graphene.Enum):
    class Meta:
        enum = models.enums.Currencies


class TypePrice(graphene.ObjectType):

    provider = TypeProvider()
    price = graphene.Float(currency=TypeCurrency())

    def resolve_price(self, info, **args):
        currency = args.get("currency") or models.enums.Currencies.usd.value
        currency = models.enums.Currencies(currency)
        if currency != models.enums.Currencies.usd:
            return CurrencyConverter.convert(self.price, models.enums.Currencies.usd, currency)
        return self.price


class BaseTypeSkin(graphene.ObjectType):
    class Meta:
        interfaces = (graphene.relay.Node,)

    name = graphene.String()
    slug = graphene.String()
    image_url = graphene.String()
    prices = graphene.List(TypePrice)
