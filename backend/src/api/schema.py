# -*- coding: utf-8 -*-

import graphene

from . import contact
from . import csgo
from . import history


class Query(csgo.Query, history.Query, graphene.ObjectType):
    pass


class Mutation(contact.Mutation, graphene.ObjectType):
    pass


schema = graphene.Schema(
    query=Query,
    mutation=Mutation,
)
