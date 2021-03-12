# -*- coding: utf-8 -*-

import factory

from models import User


class UserFactory(factory.mongoengine.MongoEngineFactory):
    class Meta:
        model = User

    steam_id = factory.Faker("pystr_format", string_format="#" * 17)
    username = factory.Faker("user_name")
