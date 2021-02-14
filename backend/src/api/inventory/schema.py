# -*- coding: utf-8 -*-

import graphene
import requests
from flask_jwt_extended import jwt_optional
from src.api.csgo.types import SkinConnection
from src.models.csgo import Skin
from src.models.enums import Apps
from src.providers.steam import Steam
from src.utils.users import get_current_user


class Query(graphene.ObjectType):
    inventory = graphene.relay.ConnectionField(SkinConnection, steam_id=graphene.String())

    @jwt_optional
    def resolve_inventory(self, info, **args):
        client = Steam(Apps.csgo)

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
        skin_ids = set()
        data = res.get("descriptions", [])
        for item in data:
            skin = client.parser.get_skin_from_item_name(item["market_hash_name"])
            if skin:
                skin_ids.add(skin.id)

        query = Skin.objects.filter(id__in=skin_ids)
        query = query.order_by("weapon", "name", "souvenir", "stat_trak", "quality")

        # force caching the queryset length to avoid horrible performances when a `len`
        # is called on the queryset later on in graphql_relay.connection.arrayconnection.connection_from_list
        # http://docs.mongoengine.org/guide/querying.html#counting-results
        query.count(with_limit_and_skip=True)
        return query
