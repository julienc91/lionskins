# -*- coding: utf-8 -*-

import graphene

from ..types import BaseTypeSkin
from ... import models


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


class TypeCSGOWeapon(graphene.ObjectType):

    name = CSGOWeapons()
    category = CSGOCategories()


class TypeCSGOSkin(BaseTypeSkin):

    class Meta:
        interfaces = (graphene.relay.Node, )

    model = models.csgo.Skin

    weapon = graphene.Field(TypeCSGOWeapon)
    stat_trak = graphene.Boolean()
    souvenir = graphene.Boolean()
    quality = CSGOQualities()
    rarity = CSGORarities()


class SkinConnection(graphene.relay.Connection):

    class Meta:
        node = TypeCSGOSkin
