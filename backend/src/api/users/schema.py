# -*- coding: utf-8 -*-

from http import HTTPStatus

import graphene
from flask_jwt_extended import create_access_token, jwt_refresh_token_required, jwt_required

from .types import TypeUser
from ..generic import AbstractMutation
from ...utils.users import get_current_user


class RefreshToken(AbstractMutation):

    access_token = graphene.Field(graphene.String)

    @classmethod
    @jwt_refresh_token_required
    def mutate(cls, *args, **kwargs):
        user = get_current_user()
        if not user:
            return cls.handle_error(HTTPStatus.UNAUTHORIZED, "invalid token")
        user.set_last_login()
        access_token = create_access_token(identity=user.jwt_identity)
        return cls(access_token=access_token)


class Mutation(graphene.ObjectType):
    refresh_token = RefreshToken.Field()


class Query(graphene.ObjectType):
    current_user = graphene.Field(TypeUser)

    @jwt_required
    def resolve_current_user(self, info, **args):
        user = get_current_user()
        return user
