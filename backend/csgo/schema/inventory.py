from collections import defaultdict
from datetime import timedelta

import graphene
from django.utils import timezone
from graphene_django.filter.fields import DjangoFilterConnectionField

from csgo.models.skin import Skin
from csgo.providers.steam import get_inventory
from csgo.schema.skin import SkinNode
from users.models import Inventory, SkinInventory, User


class Query(graphene.ObjectType):
    inventory = DjangoFilterConnectionField(
        SkinNode, pro_player_id=graphene.ID(), max_limit=5000
    )

    def resolve_inventory(self, info, **args):
        queryset = Skin.objects.all()
        pro_player_id = args.get("pro_player_id")
        if pro_player_id:
            try:
                user = User.objects.get(proplayer__id=pro_player_id)
            except User.DoesNotExist:
                return queryset.none()
        elif info.context.user.is_anonymous:
            return queryset.none()
        else:
            user = info.context.user

        inventory, created = Inventory.objects.get_or_create(user=user)
        if should_refresh_inventory(inventory, bool(pro_player_id), created):
            if not refresh_inventory(user, inventory):
                return queryset.none()

        return SkinNode.get_queryset(
            queryset.filter(skininventory__inventory=inventory), info
        )


def should_refresh_inventory(
    inventory: Inventory, is_pro_player: bool, is_newly_created: bool
) -> bool:
    if is_newly_created:
        return True

    if is_pro_player:
        return inventory.update_date < timezone.now() - timedelta(hours=1)
    if inventory.in_error:
        return inventory.update_date < timezone.now() - timedelta(minutes=1)
    return inventory.update_date < timezone.now() - timedelta(minutes=10)


def refresh_inventory(user: User, inventory: Inventory) -> bool:
    raw_inventory, ok = get_inventory(steam_id=user.steam_id)
    inventory.update_date = timezone.now()
    inventory.in_error = not ok
    inventory.save()

    if ok:
        market_hash_names = {item["market_hash_name"] for item in raw_inventory}
        skins = Skin.objects.filter(market_hash_name__in=market_hash_names).values_list(
            "pk", "market_hash_name"
        )

        skin_id_by_market_hash_name = {
            market_hash_name: skin_id for skin_id, market_hash_name in skins
        }
        counter_by_skin_id = defaultdict(int)
        for item in raw_inventory:
            if item["market_hash_name"] in skin_id_by_market_hash_name:
                counter_by_skin_id[
                    skin_id_by_market_hash_name[item["market_hash_name"]]
                ] += 1

        SkinInventory.objects.filter(inventory=inventory).delete()
        SkinInventory.objects.bulk_create(
            SkinInventory(inventory=inventory, skin_id=skin_id, quantity=quantity)
            for skin_id, quantity in counter_by_skin_id.items()
        )

    return ok
