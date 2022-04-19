import graphene
from django.db.models import Count, F, Func, Prefetch, Sum, Window
from django_filters import BooleanFilter, CharFilter, ChoiceFilter, FilterSet
from graphene import relay
from graphene_django import DjangoObjectType
from graphene_django.filter.fields import DjangoFilterConnectionField

from csgo.models import Skin, enums
from csgo.schema.types import (
    CollectionField,
    QualityField,
    RarityField,
    TypeDescription,
    TypeField,
    TypePrices,
    TypeWeapon,
)
from lionskins.models.enums import Currencies, Providers
from lionskins.schema.types import TypeCurrency


class SkinFilter(FilterSet):
    slug = CharFilter(field_name="group_slug")
    category = CharFilter(method="filter_category")
    group = BooleanFilter(method="filter_group")
    search = CharFilter(method="filter_search")
    quality = ChoiceFilter(method="filter_quality", choices=[(name, name) for name in enums.Qualities.names])

    class Meta:
        model = Skin
        fields = ["slug", "stat_trak", "souvenir", "quality", "rarity", "weapon", "category", "type", "group", "search"]

    def filter_category(self, queryset, name, value):
        weapons = enums.Weapons.by_category(value)
        return queryset.filter(weapon__in=weapons)

    def filter_quality(self, queryset, name, value):
        value = enums.Qualities[value]
        return queryset.filter(quality=value)

    def filter_search(self, queryset, name, value):
        return queryset.filter(market_hash_name__search=value)

    def filter_group(self, queryset, name, value):
        return queryset

    def filter_queryset(self, queryset):
        queryset = super().filter_queryset(queryset)
        if self.data.get("group"):
            queryset = SkinQuerysetWrapper(queryset)
        return queryset


class SkinNode(DjangoObjectType):
    slug = graphene.String(source="group_slug")
    name = graphene.String(source="group_name")
    weapon = graphene.Field(TypeWeapon)
    type = TypeField()
    quality = QualityField()
    rarity = RarityField()
    collection = CollectionField()
    description = graphene.Field(TypeDescription)
    prices = graphene.Field(TypePrices, currency=TypeCurrency())

    class Meta:
        model = Skin
        interfaces = (relay.Node,)
        filter_fields = []
        fields = [
            "type",
            "slug",
            "name",
            "image_url",
            "weapon",
            "stat_trak",
            "souvenir",
            "quality",
            "rarity",
            "collection",
            "description",
            "prices",
        ]

    @classmethod
    def get_queryset(cls, queryset, info):
        return queryset.prefetch_related(Prefetch("prices", to_attr="all_prices"))

    def resolve_quality(self: Skin, *args, **kwargs):
        if self.quality is None:
            return None
        return enums.Qualities.from_int(int(self.quality))

    def resolve_weapon(self: Skin, *args, **kwargs):
        if not self.weapon:
            return None
        weapon = enums.Weapons(self.weapon)
        return TypeWeapon(name=weapon.value, category=weapon.category.value)

    def resolve_prices(self: Skin, info, currency):
        currency = currency or Currencies.usd
        prices = self.all_prices
        kwargs = {}
        for provider in Providers.active():
            provider_prices = [price for price in prices if price.provider == provider and price.price > 0]
            kwargs[provider] = min(provider_prices, key=lambda p: p.price).convert(currency) if provider_prices else None
        return TypePrices(**kwargs)


class SkinQuerysetWrapper:
    grouping = ("type", "weapon", "group_slug")

    def __init__(self, queryset):
        self.queryset = queryset
        self._start_index = None
        self._end_index = None
        self._aggregated_results = None

    def __len__(self):
        return self.queryset.values(*self.grouping).distinct().count()

    @staticmethod
    def _is_same_group(first, second) -> bool:
        return first.type == second.type and first.weapon == second.weapon and first.group_slug == second.group_slug

    @staticmethod
    def _aggregate(*skins) -> Skin | None:
        if not skins:
            return None

        aggregated_skin = Skin(
            id=skins[0].id,
            group_name=skins[0].group_name,
            group_slug=skins[0].group_slug,
            type=skins[0].type,
            weapon=skins[0].weapon,
            stat_trak=any(s.stat_trak for s in skins),
            souvenir=any(s.souvenir for s in skins),
            rarity=next((s.rarity for s in skins if s.rarity), None),
            quality=next((s.quality for s in skins if s.quality), None),
            collection=next((s.collection for s in skins if s.collection), None),
            description=next((s.description for s in skins if s.description), None),
            image_url=next((s.image_url for s in skins if s.image_url), None),
        )
        aggregated_skin.all_prices = sum((s.all_prices for s in skins), [])
        return aggregated_skin

    @property
    def __group_cache(self):
        return (
            self.queryset.order_by()
            .values("type", "weapon", "group_slug")
            .annotate(
                count=Count("id"),
                total=Window(
                    expression=Sum(Func("id", function="COUNT")), order_by=(F("type").desc(), F("weapon"), F("group_slug"))
                ),
            )
        )

    def __getitem__(self, item: slice):
        res = self
        if self._start_index is None and item.start is not None:
            self._start_index = item.start

        if self._end_index is None and item.stop is not None:
            self._end_index = item.stop

        if self._start_index is not None and self._end_index is not None:
            if self._aggregated_results is not None:
                raise RuntimeError("Cannot slice more than once")

            if self._end_index == 0:
                fetched_results = []
            else:
                group_cache = list(self.__group_cache[self._start_index : self._start_index + self._end_index])
                try:
                    start_group = group_cache[0]
                    real_start_index = start_group["total"] - start_group["count"]
                except IndexError:
                    real_start_index = 0

                try:
                    end_group = group_cache[-1]
                    real_end_index = end_group["total"]
                except IndexError:
                    real_end_index = None

                fetched_results = list(
                    self.queryset[real_start_index:real_end_index].prefetch_related(Prefetch("prices", to_attr="all_prices"))
                )
            self._aggregated_results = self.aggregate_results(fetched_results)
        return res

    def __iter__(self):
        return iter(self._aggregated_results)

    def aggregate_results(self, fetched_results):
        res = []
        current_batch = []
        for item in fetched_results:
            if current_batch and not self._is_same_group(item, current_batch[0]):
                res.append(self._aggregate(*current_batch))
                current_batch = []
            current_batch.append(item)

        if current_batch:
            res.append(self._aggregate(*current_batch))
        return res


class Query(graphene.ObjectType):
    csgo = DjangoFilterConnectionField(SkinNode, filterset_class=SkinFilter, max_limit=100)
