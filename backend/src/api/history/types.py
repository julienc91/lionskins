# -*- coding: utf-8 -*-

import graphene

from ... import models
from ...utils import CurrencyConverter
from ..skins import TypeCurrency, TypeProvider


class TypeHistory(graphene.ObjectType):
    class Meta:
        interfaces = (graphene.relay.Node,)

    model = models.History

    skin = graphene.GlobalID()
    provider = TypeProvider()
    price = graphene.Float(currency=TypeCurrency())
    creation_date = graphene.DateTime()

    def resolve_price(self, info, **args):
        currency = args.get("currency") or models.enums.Currencies.usd.value
        currency = models.enums.Currencies(currency)
        self.currency = currency
        if currency != models.enums.Currencies.usd:
            self.price = CurrencyConverter.convert(self.price, models.enums.Currencies.usd, currency)
        return self.price

    def resolve_skin(self, info, **args):
        return self.skin.id


class HistoryConnection(graphene.relay.Connection):
    class Meta:
        node = TypeHistory
