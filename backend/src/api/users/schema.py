# -*- coding: utf-8 -*-

from http import HTTPStatus

import graphene
from flask import request
from flask_jwt_extended import (
    create_access_token,
    create_refresh_token,
    jwt_refresh_token_required,
    jwt_required
)

from .types import TypeUser
from ..exceptions import ApiError
from ...models import User
from ...utils.captcha import check_captcha
from ...utils.users import get_current_user


class Create(graphene.Mutation):
    class Input:
        username = graphene.String(required=True)
        password = graphene.String(required=True)
        captcha = graphene.String(required=True)

    access_token = graphene.Field(graphene.String)
    refresh_token = graphene.Field(graphene.String)

    @classmethod
    def mutate(cls, *args, **kwargs):
        username = kwargs['username']
        password = kwargs['password']
        if len(password) < 8:
            raise ApiError("passwords should be at least 8 character long", HTTPStatus.BAD_REQUEST, field="password")
        if User.filter(username=username).count():
            raise ApiError("another user already exists with this username", HTTPStatus.CONFLICT, field="username")
        if not check_captcha(kwargs.get('captcha'), request.remote_addr):
            raise ApiError("invalid captcha", HTTPStatus.BAD_REQUEST, field="captcha")
        user = User.create(username=kwargs.get('username'), password=kwargs['password'])
        access_token = create_access_token(identity=user.jwt_identity)
        refresh_token = create_refresh_token(identity=user.jwt_identity)
        return cls(access_token=access_token, refresh_token=refresh_token)


class Authenticate(graphene.Mutation):
    class Input:
        username = graphene.String(required=True)
        password = graphene.String(required=True)

    access_token = graphene.Field(graphene.String)
    refresh_token = graphene.Field(graphene.String)

    @classmethod
    def mutate(cls, *args, **kwargs):
        username = kwargs['username']
        password = kwargs['password']
        try:
            user = User.get(username=username)
        except User.DoesNotExist:
            raise ApiError("invalid user or password", HTTPStatus.UNAUTHORIZED)
        if not user.check_password(password):
            raise ApiError("invalid user or, password", HTTPStatus.UNAUTHORIZED)

        access_token = create_access_token(identity=user.jwt_identity)
        refresh_token = create_refresh_token(identity=user.jwt_identity)
        user.set_last_login()
        return cls(access_token=access_token, refresh_token=refresh_token)


class RefreshToken(graphene.Mutation):

    access_token = graphene.Field(graphene.String)

    @classmethod
    @jwt_refresh_token_required
    def mutate(cls, *args, **kwargs):
        user = get_current_user()
        user.set_last_login()
        access_token = create_access_token(identity=user.jwt_identity)
        return cls(access_token=access_token)


class Mutation(graphene.ObjectType):
    create_user = Create.Field()
    authenticate = Authenticate.Field()
    refresh_token = RefreshToken.Field()


class Query(graphene.ObjectType):
    current_user = graphene.Field(TypeUser)

    @jwt_required
    def resolve_current_user(self, info, **args):
        user = get_current_user()
        return user
