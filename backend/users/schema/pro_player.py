import graphene
from graphene_django import DjangoObjectType
from graphene_django.filter import DjangoFilterConnectionField

from users.models import ProPlayer, ProTeam


class TypeProPlayer(DjangoObjectType):
    steam_id = graphene.String()

    class Meta:
        model = ProPlayer
        fields = ["id", "nickname", "slug", "role", "country_code", "steam_id"]

    def resolve_steam_id(self, info):
        return self.user.steam_id


class TypeProTeam(DjangoObjectType):
    players = graphene.List(TypeProPlayer)

    class Meta:
        model = ProTeam
        filter_fields = ["slug"]
        fields = ["id", "name", "slug", "rank", "players"]
        interfaces = (graphene.relay.Node,)

    def resolve_players(self, info):
        return sorted(self.players.all(), key=lambda x: x.nickname.lower())


class Query(graphene.ObjectType):
    teams = DjangoFilterConnectionField(TypeProTeam)

    def resolve_teams(self, info, **args):
        return (
            ProTeam.objects.exclude(rank=None)
            .prefetch_related("players__user")
            .order_by("rank")
        )
