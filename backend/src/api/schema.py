# -*- coding: utf-8 -*-

import graphene

from . import contact, csgo, inventory, lists, users


class Query(csgo.Query, inventory.Query, lists.Query, users.Query, graphene.ObjectType):
    pass


class Mutation(contact.Mutation, lists.Mutation, users.Mutation, graphene.ObjectType):
    pass


schema = graphene.Schema(query=Query, mutation=Mutation)
