import graphene
from graphene_django import DjangoObjectType
from graphql import GraphQLError

from users.models import User


class TypeUser(DjangoObjectType):
    class Meta:
        model = User
        fields = ["id", "username", "steam_id"]


class Query(graphene.ObjectType):
    current_user = graphene.Field(TypeUser)

    def resolve_current_user(self, info, **args):
        user = info.context.user
        if user.is_anonymous:
            raise GraphQLError("Not logged in")
        return user
