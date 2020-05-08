# -*- coding: utf-8 -*-

from http import HTTPStatus

import graphene
from flask import request
from flask_jwt_extended import create_access_token, create_refresh_token, jwt_refresh_token_required, jwt_required

from .types import TypeUser
from ..generic import AbstractMutation
from ...models import User
from ...utils.captcha import check_captcha
from ...utils.users import get_current_user


class Create(AbstractMutation):
    class Arguments:
        username = graphene.String(required=True)
        password = graphene.String(required=True)
        captcha = graphene.String(required=True)

    access_token = graphene.Field(graphene.String)
    refresh_token = graphene.Field(graphene.String)

    @classmethod
    def mutate(cls, *args, **kwargs):
        username = kwargs["username"]
        password = kwargs["password"]
        if len(password) < 8:
            return cls.handle_error(HTTPStatus.BAD_REQUEST, "passwords should be at least 8 character long", "password", "min")
        if User.filter(username=username).count():
            return cls.handle_error(HTTPStatus.CONFLICT, "another user already exists with this username", "username", "conflict")
        if not check_captcha(kwargs.get("captcha"), request.remote_addr):
            return cls.handle_error(HTTPStatus.BAD_REQUEST, "invalid captcha", "captcha", "invalid")
        user = User.create(username=kwargs.get("username"), password=kwargs["password"])
        access_token = create_access_token(identity=user.jwt_identity)
        refresh_token = create_refresh_token(identity=user.jwt_identity)
        return cls(access_token=access_token, refresh_token=refresh_token)


class Authenticate(AbstractMutation):
    class Arguments:
        username = graphene.String(required=True)
        password = graphene.String(required=True)

    access_token = graphene.Field(graphene.String)
    refresh_token = graphene.Field(graphene.String)

    @classmethod
    def mutate(cls, *args, **kwargs):
        username = kwargs["username"]
        password = kwargs["password"]
        try:
            user = User.get(username=username)
        except User.DoesNotExist:
            return cls.handle_error(HTTPStatus.UNAUTHORIZED, "invalid user or password")
        if not user.check_password(password):
            return cls.handle_error(HTTPStatus.UNAUTHORIZED, "invalid user or password")

        access_token = create_access_token(identity=user.jwt_identity)
        refresh_token = create_refresh_token(identity=user.jwt_identity)
        user.set_last_login()
        return cls(access_token=access_token, refresh_token=refresh_token)


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
    create_user = Create.Field()
    authenticate = Authenticate.Field()
    refresh_token = RefreshToken.Field()


class Query(graphene.ObjectType):
    current_user = graphene.Field(TypeUser)

    @jwt_required
    def resolve_current_user(self, info, **args):
        user = get_current_user()
        return user
