import enum

from django.db.models import TextChoices


class Apps(TextChoices):
    csgo = "csgo", "Counter-Strike: Global Offensive"


class Providers(TextChoices):
    steam = "steam", "Steam"
    bitskins = "bitskins", "BitSkins"
    csmoney = "csmoney", "CSMoney"
    skinbaron = "skinbaron", "SkinBaron"
    skinport = "skinport", "Skinport"

    csgoshop = "csgopshop", "csgoshop"
    lootbear = "lootbear", "Lootbear"

    @classmethod
    def active(cls) -> list["Providers"]:
        return [cls.steam, cls.bitskins, cls.csmoney, cls.skinbaron, cls.skinport]


class Currencies(enum.Enum):
    eur = "€"
    usd = "$"
