import graphene
from graphene_django.filter.fields import DjangoFilterConnectionField

from csgo.models.skin import Skin
from csgo.providers.steam import get_inventory
from csgo.schema.skin import SkinNode


class Query(graphene.ObjectType):
    inventory = DjangoFilterConnectionField(
        SkinNode, steam_id=graphene.String(), max_limit=100
    )

    def resolve_inventory(self, info, **args):
        steam_id = args.get("steam_id")
        if not steam_id:
            user = info.context.user
            if user.is_anonymous:
                return []
            steam_id = user.steam_id

        inventory = get_inventory(steam_id)
        if inventory is None:
            return []

        data = inventory.get("descriptions", [])
        market_hash_names = {item["market_hash_name"] for item in data}

        return SkinNode.get_queryset(
            Skin.objects.filter(market_hash_name__in=market_hash_names), info
        )
