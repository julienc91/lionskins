# -*- coding: utf-8 -*-

import graphene

from . import csgo
from ..models import Contact
from ..init import sqlalchemy as db


class Query(graphene.ObjectType):
    csgo = csgo.SkinConnection(csgo.TypeCSGOSkin)


class ContactMessage(graphene.Mutation):
    class Input:
        name = graphene.String()
        email = graphene.String()
        message = graphene.String(required=True)
        captcha = graphene.String(required=True)

    message_id = graphene.Field(graphene.String, name='id')

    @classmethod
    def mutate(cls, *args, **kwargs):
        if Contact.check_captcha(kwargs.get('captcha')):
            res = Contact(name=kwargs.get('name'), email=kwargs.get('email'), message=kwargs['message'])
            db.session.commit()
            return cls(message_id=res.id)
        return cls(message_id=None)


class Mutation(graphene.ObjectType):
    contact = ContactMessage.Field()


schema = graphene.Schema(
    query=Query,
    mutation=Mutation,
)
