import factory

from users.models import User


class UserFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = User

    steam_id = factory.Faker("pystr_format", string_format="#" * 17)
    username = factory.Faker("user_name")
