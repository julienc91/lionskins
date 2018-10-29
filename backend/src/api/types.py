# -*- coding: utf-8 -*-

import graphene
from graphene_sqlalchemy import SQLAlchemyObjectType

from .. import models


class TypePrice(SQLAlchemyObjectType):
    class Meta:
        model = models.Price
        only_fields = ('provider', 'price', 'creation_date', 'currency', )

    provider = graphene.String()
    currency = graphene.String()

    def resolve_provider(self, info):
        return self.provider.id.name

    def resolve_currency(self, info):
        return models.enums.Currencies.usd.name


class BaseTypeSkin(SQLAlchemyObjectType):
    class Meta:
        model = models.Skin
        only_fields = ('id', 'name', 'image_url', 'prices', )
        interfaces = (graphene.relay.Node, )
