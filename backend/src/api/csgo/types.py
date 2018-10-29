# -*- coding: utf-8 -*-

from collections import OrderedDict

import graphene
from graphene_sqlalchemy import SQLAlchemyConnectionField, SQLAlchemyObjectType
from sqlalchemy import func, cast, String

from ..types import BaseTypeSkin
from ... import models
from ...init import sqlalchemy as db


class CSGOWeapons(graphene.Enum):
    class Meta:
        enum = models.csgo.enums.Weapons


class CSGOQualities(graphene.Enum):
    class Meta:
        enum = models.csgo.enums.Qualities


class CSGORarities(graphene.Enum):
    class Meta:
        enum = models.csgo.enums.Rarities


class CSGOCategories(graphene.Enum):
    class Meta:
        enum = models.csgo.enums.Categories


class TypeCSGOWeapon(SQLAlchemyObjectType):
    class Meta:
        model = models.csgo.Weapon
        only_fields = ('name', 'category',)

    name = graphene.String()

    def resolve_name(self, info):
        return self.id.name

    def resolve_category(self, info):
        return self.category.name


class TypeCSGOSkin(BaseTypeSkin):
    class Meta:
        model = models.csgo.Skin
        only_fields = ('id', 'name', 'slug', 'image_url', 'prices', 'weapon',
                       'stat_trak', 'souvenir', 'quality', 'rarity',)
        interfaces = (graphene.relay.Node,)

    weapon = graphene.Field(
        TypeCSGOWeapon,
    )

    def resolve_weapon(self, info):
        return self.weapon

    def resolve_quality(self, info):
        return self.quality.name

    def resolve_rarity(self, info):
        return self.rarity.name if self.rarity else ''


class SkinConnection(SQLAlchemyConnectionField):

    def __init__(self, type_, *args, **kwargs):
        super().__init__(type_, *args, **kwargs)
        self.args = OrderedDict(
            [('slug', graphene.Argument(type=graphene.String)),
             ('stat_trak', graphene.Argument(type=graphene.Boolean)),
             ('souvenir', graphene.Argument(type=graphene.Boolean)),
             ('quality', graphene.Argument(type=CSGOQualities)),
             ('rarity', graphene.Argument(type=CSGORarities)),
             ('weapon', graphene.Argument(type=CSGOWeapons)),
             ('category', graphene.Argument(type=CSGOCategories)),
             ('provider', graphene.Argument(type=graphene.Enum.from_enum(models.enums.Providers))),
             ('search', graphene.Argument(type=graphene.String)),
             ] + list(self.args.items()))

    @classmethod
    def get_query(cls, model, info, **args):
        query = super().get_query(model, info, **args)
        if args.get('slug'):
            query = query.filter(models.csgo.Skin.slug == args['slug'])
        if args.get('stat_trak') is not None:
            query = query.filter(models.csgo.Skin.stat_trak == args['stat_trak'])
        if args.get('souvenir') is not None:
            query = query.filter(models.csgo.Skin.souvenir == args['souvenir'])
        if args.get('quality'):
            quality = models.csgo.enums.Qualities(args['quality'])
            query = query.filter(models.csgo.Skin.quality == quality)
        if args.get('rarity'):
            rarity = models.csgo.enums.Rarities(args['rarity'])
            query = query.filter(models.csgo.Skin.rarity == rarity)

        if args.get('weapon') or args.get('category'):
            query = query.join(models.csgo.Weapon)
            if args.get('weapon'):
                weapon = models.csgo.enums.Weapons(args['weapon'])
                query = query.filter(models.csgo.Weapon.id == weapon)
            if args.get('category'):
                category = models.csgo.enums.Categories(args['category'])
                query = query.filter(models.csgo.Weapon.category == category)

        if args.get('provider'):
            query = query.join(models.Price)
            provider = models.Providers(args['provider'])
            query = query.filter(models.Price.provider_id == provider)

        if args.get('search'):
            search = '%' + args['search'].lower() + '%'
            query = query.filter(func.lower(models.Skin.name).like(search))

        sort_by_quality = db.case(value=models.csgo.Skin.quality, whens={
            models.csgo.enums.Qualities.factory_new.name: 1,
            models.csgo.enums.Qualities.minimal_wear.name: 2,
            models.csgo.enums.Qualities.field_tested.name: 3,
            models.csgo.enums.Qualities.well_worn.name: 4,
            models.csgo.enums.Qualities.battle_scarred.name: 5,
        })
        query = query.order_by(cast(models.csgo.Skin.weapon_id, String).asc(), models.csgo.Skin.name.asc(),
                               models.csgo.Skin.souvenir.asc(), models.csgo.Skin.stat_trak.asc(),
                               sort_by_quality)

        return query
