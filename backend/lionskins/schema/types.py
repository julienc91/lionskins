import graphene

from lionskins.models import enums


class TypeCurrency(graphene.Enum):
    class Meta:
        enum = enums.Currencies
