# -*- coding: utf-8 -*-

from .bitskins import Bitskins
from .csgoshop import CSGOShop
from .lootbear import Lootbear
from .steam import Steam
from ..models import Provider
from ..init import sqlalchemy as db

clients = [Bitskins, CSGOShop, Lootbear, Steam]
providers = {}

# TODO: skinbaron, gameflip.com, skinxchange.com, dmarket.com

for client in clients:
    provider = Provider.get_or_create(id=client.provider)
    if not provider:
        provider = Provider(id=client.provider)
        db.session.commit()
    providers[client.provider] = (provider, client)
