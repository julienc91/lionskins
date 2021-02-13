# -*- coding: utf-8 -*-

import graphene
from mongoengine.fields import DBRef

from ... import models
from ..skins import BaseTypeSkin


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


class CSGOCollections(graphene.Enum):
    class Meta:
        enum = models.csgo.enums.Collections


class TypeCSGOWeapon(graphene.ObjectType):

    name = CSGOWeapons()
    category = CSGOCategories()


class TypeCSGOSkin(BaseTypeSkin):
    class Meta:
        interfaces = (graphene.relay.Node,)

    class TypeDescription(graphene.ObjectType):
        en = graphene.String()
        fr = graphene.String()

    model = models.csgo.Skin

    weapon = graphene.Field(TypeCSGOWeapon)
    stat_trak = graphene.Boolean()
    souvenir = graphene.Boolean()
    quality = CSGOQualities()
    rarity = CSGORarities()
    collection = CSGOCollections()
    description = graphene.Field(TypeDescription)

    def resolve_weapon(self, *args, **kwargs):
        weapon = self.weapon
        if isinstance(weapon, DBRef):
            weapon = models.csgo.Weapon.get_cache(weapon.id)
        return TypeCSGOWeapon(name=weapon.name, category=weapon.category)


class SkinConnection(graphene.relay.Connection):
    class Meta:
        node = TypeCSGOSkin
