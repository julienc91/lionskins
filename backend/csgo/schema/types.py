import graphene

from csgo.models import enums


class QualityField(graphene.Enum):
    class Meta:
        enum = enums.Qualities


class RarityField(graphene.Enum):
    class Meta:
        enum = enums.Rarities


class TypeField(graphene.Enum):
    class Meta:
        enum = enums.Types


class CollectionField(graphene.Enum):
    class Meta:
        enum = enums.Collections


class TypeWeapon(graphene.ObjectType):
    class WeaponField(graphene.Enum):
        class Meta:
            enum = enums.Weapons

    class CategoryField(graphene.Enum):
        class Meta:
            enum = enums.WeaponCategories

    name = WeaponField()
    category = CategoryField()


class TypeDescription(graphene.ObjectType):
    en = graphene.String()
    fr = graphene.String()


class TypePrices(graphene.ObjectType):
    steam = graphene.Float()
    bitskins = graphene.Float()
    csmoney = graphene.Float()
    skinbaron = graphene.Float()
    skinport = graphene.Float()
