from lionskins.models.enums import Providers

from .bitskins import BitSkinsClient
from .csmoney import CSMoneyClient
from .skinbaron import SkinBaronClient
from .skinport import SkinportClient
from .steam import SteamClient

client_by_provider = {
    Providers.bitskins: BitSkinsClient,
    Providers.csmoney: CSMoneyClient,
    Providers.skinport: SkinportClient,
    Providers.skinbaron: SkinBaronClient,
    Providers.steam: SteamClient,
}
