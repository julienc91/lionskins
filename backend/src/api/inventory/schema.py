# -*- coding: utf-8 -*-

import graphene
import requests
from api.csgo.types import SkinConnection
from flask_jwt_extended import jwt_optional
from models.csgo import Skin
from utils.users import get_current_user


class Query(graphene.ObjectType):
    inventory = graphene.relay.ConnectionField(SkinConnection, steam_id=graphene.String())

    @jwt_optional
    def resolve_inventory(self, info, **args):
        steam_id = args.get("steam_id")
        if not steam_id:
            user = get_current_user()
            if not user:
                return []
            steam_id = user.steam_id

        res = requests.get(f"https://steamcommunity.com/inventory/{steam_id}/730/2?l=english&count=5000")
        if res.status_code == 403:
            return []
        elif res.status_code >= 500:
            return []

        res = res.json()

        data = res.get("descriptions", [])
        market_hash_names = {item["market_hash_name"] for item in data}

        query = Skin.objects.filter(market_hash_name__in=market_hash_names)
        query = query.order_by("weapon", "name", "souvenir", "stat_trak", "quality")

        # force caching the queryset length to avoid horrible performances when a `len`
        # is called on the queryset later on in graphql_relay.connection.arrayconnection.connection_from_list
        # http://docs.mongoengine.org/guide/querying.html#counting-results
        query.count(with_limit_and_skip=True)
        return query
