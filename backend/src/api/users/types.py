# -*- coding: utf-8 -*-

import graphene
from src import models


class TypeUser(graphene.ObjectType):
    class Meta:
        interfaces = (graphene.relay.Node,)

    model = models.User

    username = graphene.String()
    steam_id = graphene.String()
