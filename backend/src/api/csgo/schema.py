# -*- coding: utf-8 -*-

import graphene

from api.csgo.types import (
    CSGOCategories,
    CSGOQualities,
    CSGORarities,
    CSGOTypes,
    CSGOWeapons,
    SkinConnection,
    TypeCSGOSkin,
)
from models import csgo as csgo_models


class QueryWrapper:
    def __init__(self, queryset, pipeline):
        self.pipeline = pipeline
        self.queryset = queryset
        self._cache_length = None

    def __len__(self):
        if self._cache_length is None:
            try:
                self._cache_length = next(self.queryset.aggregate(self.pipeline + [{"$count": "total"}]))["total"]
            except StopIteration:
                self._cache_length = 0
        return self._cache_length

    def __iter__(self):
        return self.queryset.aggregate(self.pipeline)

    def __getitem__(self, item: slice):
        stages = []
        if item.start:
            stages.append({"$skip": item.start})
        if item.stop:
            stages.append({"$limit": item.stop - (item.start or 0)})
        return self.queryset.aggregate(self.pipeline + stages)


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
        type=CSGOTypes(),
        group=graphene.Boolean(),
    )

    def resolve_csgo(self, info, **args):
        query = TypeCSGOSkin.model.objects
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
            filters["weapon"] = csgo_models.enums.Weapons(args["weapon"])
        elif args.get("category"):
            category = csgo_models.enums.WeaponCategories(args["category"])
            weapons = csgo_models.enums.Weapons.by_category(category)
            filters["weapon__in"] = weapons
        elif args.get("type"):
            filters["type"] = csgo_models.enums.Types(args["type"])

        if args.get("search"):
            search = " ".join(f'"{word}"' for word in args["search"].split())
            query = query.search_text(search)

        query = query.filter(**filters)
        pipeline = [
            {
                "$group": {
                    "_id": "$_id",
                    "id": {"$first": "$_id"},
                    "name": {"$first": "$name"},
                    "slug": {"$first": "$slug"},
                    "type": {"$first": "$type"},
                    "weapon": {"$first": "$weapon"},
                    "stat_trak": {"$max": "$stat_trak"},
                    "souvenir": {"$max": "$souvenir"},
                    "rarity": {"$first": "$rarity"},
                    "quality": {"$first": "$quality"},
                    "collection": {"$first": "$collection"},
                    "description": {"$first": "$description"},
                    "image_url": {"$first": "$image_url"},
                    "prices": {"$push": "$prices"},
                }
            },
            {"$sort": {"type": -1, "weapon": 1, "slug": 1, "souvenir": 1, "stat_trak": 1, "quality": 1}},
        ]
        if args.get("group"):
            pipeline[0]["$group"]["_id"] = {"weapon": "$weapon", "slug": "$slug"}
            del pipeline[0]["$group"]["quality"]

        return QueryWrapper(query, pipeline)
