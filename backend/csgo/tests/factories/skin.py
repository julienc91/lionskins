import factory
from faker import Faker
from slugify import slugify

from csgo.models import Skin
from csgo.models.enums import Qualities, Rarities, Types, Weapons

faker = Faker()


class SkinFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Skin

    group_name = factory.Faker("word")
    image_url = factory.Faker("image_url")

    weapon = factory.Faker("random_element", elements=Weapons)
    stat_trak = False
    souvenir = False
    quality = factory.Faker("random_element", elements=Qualities)
    rarity = factory.Faker("random_element", elements=Rarities)
    type = Types.weapons

    @factory.post_generation
    def post_generation(self: Skin, create, extracted, **kwargs):
        self.market_hash_name = self._get_market_hash_name()
        self.group_slug = slugify(self.group_name)
        self.description = {"en": faker.paragraph(), "fr": faker.paragraph()}
