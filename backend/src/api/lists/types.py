# -*- coding: utf-8 -*-

import graphene

from ... import models
from ..skins import BaseTypeSkin
from ..users.types import TypeUser


class TypeItem(graphene.ObjectType):
    model = models.lists.Item

    skin = graphene.Field(BaseTypeSkin)
    creation_date = graphene.DateTime()


class TypeItemContainer(graphene.ObjectType):
    model = models.lists.ItemContainer

    items = graphene.List(TypeItem)
    count_items = graphene.Int()

    def resolve_count_items(self, info, **args):
        return len(self.items)


class TypeList(graphene.ObjectType):
    class Meta:
        interfaces = (graphene.relay.Node,)

    model = models.List

    name = graphene.String()
    slug = graphene.String()
    description = graphene.String()
    creation_date = graphene.DateTime()
    update_date = graphene.DateTime()
    user = graphene.Field(TypeUser)
    item_containers = graphene.List(TypeItemContainer)
    count_items = graphene.Int()

    def resolve_count_items(self, info, **args):
        return len(self.item_containers)


class ListConnection(graphene.relay.Connection):
    class Meta:
        node = TypeList
