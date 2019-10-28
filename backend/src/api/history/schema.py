# -*- coding: utf-8 -*-

import graphene

from ...models import History, enums
from ..skins import TypeCurrency, TypeProvider
from .types import HistoryConnection


class Query(graphene.ObjectType):
    history = graphene.relay.ConnectionField(
        HistoryConnection, skin=graphene.String(), currency=TypeCurrency(), provider=TypeProvider()
    )

    def resolve_history(self, info, **args):
        query = History
        filters = {}

        if args.get("skin"):
            _, skin_id = graphene.Node.from_global_id(args["skin"])
            filters["skin"] = skin_id
        if args.get("provider"):
            filters["provider"] = enums.Providers(args["provider"])

        query = query.filter(**filters)
        query = query.order_by("creation_date")

        # force caching the queryset length to avoid horrible performances when a `len`
        # is called on the queryset later on in graphql_relay.connection.arrayconnection.connection_from_list
        # http://docs.mongoengine.org/guide/querying.html#counting-results
        query.count(with_limit_and_skip=True)
        return query
