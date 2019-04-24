# -*- coding: utf-8 -*-

import graphene
from flask import request

from ...models import Contact
from ...utils.captcha import check_captcha


class ContactMessage(graphene.Mutation):
    class Input:
        name = graphene.String()
        email = graphene.String()
        message = graphene.String(required=True)
        captcha = graphene.String(required=True)

    message_id = graphene.Field(graphene.String, name='id')

    @classmethod
    def mutate(cls, *args, **kwargs):
        if check_captcha(kwargs.get('captcha'), request.remote_addr):
            res = Contact.create(name=kwargs.get('name'), email=kwargs.get('email'), message=kwargs['message'])
            return cls(message_id=res.id)
        return cls(message_id=None)


class Mutation(graphene.ObjectType):
    contact = ContactMessage.Field()
