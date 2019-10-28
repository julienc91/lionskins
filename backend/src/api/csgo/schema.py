# -*- coding: utf-8 -*-

import graphene

from .types import SkinConnection, CSGOCategories, CSGOWeapons, CSGOQualities, CSGORarities, TypeCSGOSkin
from ...models import csgo as csgo_models


class Query(graphene.ObjectType):
    csgo = graphene.relay.ConnectionField(
        SkinConnection,
        slug=graphene.String(),
        search=graphene.String(),
        stat_trak=graphene.Boolean(),
        souvenir=graphene.Boolean(),
        quality=CSGOQualities(),
        rarity=CSGORarities(),
        weapon=CSGOWeapons(),
        category=CSGOCategories(),
    )

    def resolve_csgo(self, info, **args):
        query = TypeCSGOSkin.model
        filters = {}

        if args.get("slug"):
            filters["slug"] = args["slug"]
        if args.get("stat_trak") is not None:
            filters["stat_trak"] = args["stat_trak"]
        if args.get("souvenir") is not None:
            filters["souvenir"] = args["souvenir"]
        if args.get("quality"):
            filters["quality"] = csgo_models.enums.Qualities(args["quality"])
        if args.get("rarity"):
            filters["rarity"] = csgo_models.enums.Rarities(args["rarity"])
        if args.get("weapon"):
            weapon = csgo_models.Weapon.filter(name=csgo_models.enums.Weapons(args["weapon"])).first()
            filters["weapon"] = weapon
        elif args.get("category"):
            weapons = csgo_models.Weapon.filter(category=csgo_models.enums.Categories(args["category"]))
            filters["weapon__in"] = weapons

        if args.get("search"):
            filters["name__icontains"] = args["search"]

        query = query.filter(**filters)
        query = query.order_by("weapon", "name", "souvenir", "stat_trak", "quality")

        # force caching the queryset length to avoid horrible performances when a `len`
        # is called on the queryset later on in graphql_relay.connection.arrayconnection.connection_from_list
        # http://docs.mongoengine.org/guide/querying.html#counting-results
        query.count(with_limit_and_skip=True)
        return query
