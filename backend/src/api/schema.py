# -*- coding: utf-8 -*-

import graphene

from . import csgo
from ..models import Contact
from ..models import csgo as csgo_models


class Query(graphene.ObjectType):
    csgo = graphene.relay.ConnectionField(
        csgo.SkinConnection,
        slug=graphene.String(),
        search=graphene.String(),
        stat_trak=graphene.Boolean(),
        souvenir=graphene.Boolean(),
        quality=csgo.types.CSGOQualities(),
        rarity=csgo.types.CSGORarities(),
        weapon=csgo.types.CSGOWeapons(),
        category=csgo.types.CSGOCategories(),
    )

    def resolve_csgo(self, info, **args):
        query = csgo.TypeCSGOSkin.model
        filters = {}

        if args.get('slug'):
            filters['slug'] = args['slug']
        if args.get('stat_trak') is not None:
            filters['stat_trak'] = args['stat_trak']
        if args.get('souvenir') is not None:
            filters['souvenir'] = args['souvenir']
        if args.get('quality'):
            filters['quality'] = csgo_models.enums.Qualities(args['quality'])
        if args.get('rarity'):
            filters['rarity'] = csgo_models.enums.Rarities(args['rarity'])
        if args.get('weapon'):
            weapon = csgo_models.Weapon.filter(name=csgo_models.enums.Weapons(args['weapon'])).first()
            filters['weapon'] = weapon
        elif args.get('category'):
            weapons = csgo_models.Weapon.filter(category=csgo_models.enums.Categories(args['category']))
            filters['weapon__in'] = weapons

        if args.get('search'):
            filters['name__icontains'] = args['search']

        query = query.filter(**filters)
        query = query.order_by(
            'weapon',
            'name',
            'souvenir',
            'stat_trak',
            'quality'
        )

        return query


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
            res = Contact.create(name=kwargs.get('name'), email=kwargs.get('email'), message=kwargs['message'])
            return cls(message_id=res.id)
        return cls(message_id=None)


class Mutation(graphene.ObjectType):
    contact = ContactMessage.Field()


schema = graphene.Schema(
    query=Query,
    mutation=Mutation,
)
