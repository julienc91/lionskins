# -*- coding: utf-8 -*-

import graphene
from flask_jwt_extended import create_access_token, jwt_required

from api.users.types import TypeUser
from utils.users import get_current_user


class RefreshToken(graphene.Mutation):

    access_token = graphene.Field(graphene.String)

    @classmethod
    @jwt_required(refresh=True)
    def mutate(cls, *args, **kwargs):
        user = get_current_user()
        user.set_last_login()
        access_token = create_access_token(identity=user.jwt_identity)
        return cls(access_token=access_token)


class Mutation(graphene.ObjectType):
    refresh_token = RefreshToken.Field()


class Query(graphene.ObjectType):
    current_user = graphene.Field(TypeUser)

    @jwt_required()
    def resolve_current_user(self, info, **args):
        user = get_current_user()
        return user
