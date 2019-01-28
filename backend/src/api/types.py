# -*- coding: utf-8 -*-

import graphene

from .. import models


class TypeProvider(graphene.Enum):
    class Meta:
        enum = models.enums.Providers


class TypePrice(graphene.ObjectType):

    provider = TypeProvider()
    currency = graphene.String()
    price = graphene.Float()

    def resolve_currency(self, info):
        return models.enums.Currencies.usd.name


class BaseTypeSkin(graphene.ObjectType):
    class Meta:
        interfaces = (graphene.relay.Node, )

    name = graphene.String()
    slug = graphene.String()
    image_url = graphene.String()
    prices = graphene.List(TypePrice)
