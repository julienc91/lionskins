# -*- coding: utf-8 -*-

import factory
from faker import Faker

from models import Apps
from models.csgo import Skin
from models.csgo.enums import Qualities, Rarities, Weapons

faker = Faker()


class SkinFactory(factory.mongoengine.MongoEngineFactory):
    class Meta:
        model = Skin

    app = Apps.csgo
    name = factory.Faker("word")
    image_url = factory.Faker("image_url")
    prices = []

    weapon = factory.Faker("random_element", elements=Weapons)
    stat_trak = False
    souvenir = False
    quality = factory.Faker("random_element", elements=Qualities)
    rarity = factory.Faker("random_element", elements=Rarities)

    @factory.post_generation
    def post_generation(self: Skin, create, extracted, **kwargs):
        self.market_hash_name = self._get_market_hash_name()
        self.slug = self.generate_slug()
        self.description = {"en": faker.paragraph(), "fr": faker.paragraph()}
