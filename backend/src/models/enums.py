# -*- coding: utf-8 -*-

import enum


class Apps(enum.Enum):

    csgo = "Counter-Strike: Global Offensive"


class Providers(enum.Enum):
    steam = "Steam"
    bitskins = "BitSkins"
    csgoshop = "CSGOShop"
    lootbear = "LootBear"


class Currencies(enum.Enum):
    euros = "€"
    usd = "$"
