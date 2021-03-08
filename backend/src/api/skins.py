# -*- coding: utf-8 -*-

import itertools

import graphene

import models
from utils import CurrencyConverter


class TypeProvider(graphene.Enum):
    class Meta:
        enum = models.enums.Providers


class TypeCurrency(graphene.Enum):
    class Meta:
        enum = models.enums.Currencies


class TypePrices(graphene.ObjectType):
    steam = graphene.Float()
    bitskins = graphene.Float()
    csmoney = graphene.Float()
    skinbaron = graphene.Float()
    skinport = graphene.Float()

    def resolve_price(self, info, **args):
        res = -1
        provider = models.enums.Providers[info.field_name]
        for price in itertools.chain(*self):
            price_provider = models.enums.Providers(price["provider"])
            if price_provider is not provider:
                continue
            if res < 0 or price["price"] < res:
                res = price["price"]
        if res < 0:
            return None

        currency = args.get("currency") or models.enums.Currencies.usd.value
        currency = models.enums.Currencies(currency)
        if currency != models.enums.Currencies.usd:
            res = CurrencyConverter.convert(res, models.enums.Currencies.usd, currency)
        return res

    resolve_steam = resolve_bitskins = resolve_csmoney = resolve_skinbaron = resolve_skinport = resolve_price


class BaseTypeSkin(graphene.ObjectType):
    class Meta:
        interfaces = (graphene.relay.Node,)

    name = graphene.String()
    slug = graphene.String()
    image_url = graphene.String()
    prices = graphene.Field(TypePrices, currency=TypeCurrency())
