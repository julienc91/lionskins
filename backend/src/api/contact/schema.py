# -*- coding: utf-8 -*-

import logging

import graphene
from graphql import GraphQLError
from flask import request
from flask_jwt_extended import jwt_optional

from ...models import Contact
from ...utils.captcha import check_captcha
from ...utils.users import get_current_user


class ContactMessage(graphene.Mutation):
    class Arguments:
        name = graphene.String()
        email = graphene.String()
        message = graphene.String(required=True)
        captcha = graphene.String(required=True)

    message_id = graphene.Field(graphene.String, name="id")

    @classmethod
    @jwt_optional
    def mutate(cls, *args, **kwargs):
        if not check_captcha(kwargs.get("captcha"), request.remote_addr):
            raise GraphQLError("captcha is invalid")

        user = get_current_user()
        params = {"message": kwargs["message"]}
        if kwargs.get("email"):
            params["email"] = kwargs["email"]
        if kwargs.get("name"):
            params["name"] = kwargs["name"]
        if user:
            params["user"] = user
        res = Contact.create(**params)

        try:
            res.send()
        except Exception as e:
            logging.exception(e)
        return cls(message_id=res.id)


class Mutation(graphene.ObjectType):
    contact = ContactMessage.Field()
