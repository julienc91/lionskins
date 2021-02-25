# -*- coding: utf-8 -*-

import graphene
import requests
from api.csgo.schema import Query as csgoQuery
from api.csgo.types import SkinConnection
from flask_jwt_extended import jwt_required
from utils.users import get_current_user


class Query(graphene.ObjectType):
    inventory = graphene.relay.ConnectionField(SkinConnection, steam_id=graphene.String())

    @jwt_required(optional=True)
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

        query_wrapper = csgoQuery().resolve_csgo(None)
        query_wrapper.queryset = query_wrapper.queryset.filter(market_hash_name__in=market_hash_names)
        return query_wrapper
