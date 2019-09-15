# -*- coding: utf-8 -*-

import graphene

from . import contact
from . import csgo
from . import history
from . import lists
from . import users


class Query(csgo.Query, history.Query, lists.Query, users.Query, graphene.ObjectType):
    pass


class Mutation(contact.Mutation, lists.Mutation, users.Mutation, graphene.ObjectType):
    pass


schema = graphene.Schema(
    query=Query,
    mutation=Mutation,
)
