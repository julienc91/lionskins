# -*- coding: utf-8 -*-

import graphene

from ..users.types import TypeUser
from ... import models


class TypeList(graphene.ObjectType):

    class Meta:
        interfaces = (graphene.relay.Node, )

    model = models.List

    name = graphene.String()
    slug = graphene.String()
    description = graphene.String()
    creation_date = graphene.DateTime()
    update_date = graphene.DateTime()
    user = graphene.Field(TypeUser)
    count_items = graphene.Int()

    def resolve_count_items(self, info, **args):
        return 17


class ListConnection(graphene.relay.Connection):

    class Meta:
        node = TypeList
