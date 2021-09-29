# -*- coding: utf-8 -*-

import graphene
import structlog
from flask import request
from flask_jwt_extended import jwt_required
from graphql import GraphQLError

from models import Contact
from utils.captcha import check_captcha
from utils.users import get_current_user

logger = structlog.get_logger()


class ContactMessage(graphene.Mutation):
    class Arguments:
        name = graphene.String()
        email = graphene.String()
        message = graphene.String(required=True)
        captcha = graphene.String(required=True)

    message_id = graphene.Field(graphene.String, name="id")

    @classmethod
    @jwt_required(optional=True)
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
        if not kwargs["message"]:
            raise GraphQLError("message is empty")

        res = Contact.create(**params)

        try:
            res.send()
        except Exception as e:
            logger.exception(e)
        return cls(message_id=res.id)


class Mutation(graphene.ObjectType):
    contact = ContactMessage.Field()
