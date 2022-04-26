import graphene

from csgo.schema.inventory import Query as InventoryQuery
from csgo.schema.skin import Query as SkinQuery
from users.schema.contact import Mutation as ContactMutation
from users.schema.pro_player import Query as ProPlayersQuery
from users.schema.user import Query as UserQuery


class Query(InventoryQuery, ProPlayersQuery, SkinQuery, UserQuery, graphene.ObjectType):
    pass


class Mutation(ContactMutation, graphene.ObjectType):
    pass


schema = graphene.Schema(query=Query, mutation=Mutation)
