# -*- coding: utf-8 -*-

import graphene

from ... import models


class TypeUser(graphene.ObjectType):
    class Meta:
        interfaces = (graphene.relay.Node,)

    model = models.User

    username = graphene.String()
