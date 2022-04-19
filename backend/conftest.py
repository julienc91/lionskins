from pytest_factoryboy import register

from csgo.tests.factories.skin import SkinFactory
from users.tests.factories.user import UserFactory

for factory in [SkinFactory, UserFactory]:
    register(factory)
