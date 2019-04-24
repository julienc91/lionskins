# -*- coding: utf-8 -*-

import graphene

from . import contact
from . import csgo


class Query(csgo.Query, graphene.ObjectType):
    pass


class Mutation(contact.Mutation, graphene.ObjectType):
    pass


schema = graphene.Schema(
    query=Query,
    mutation=Mutation,
)
