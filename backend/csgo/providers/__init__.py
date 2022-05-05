from lionskins.models.enums import Providers

from .bitskins import client as bitskins_client
from .csmoney import client as csmoney_client
from .skinbaron import client as skinbaron_client
from .skinport import client as skinport_client
from .steam import client as steam_client

client_by_provider = {
    Providers.bitskins: bitskins_client,
    Providers.csmoney: csmoney_client,
    Providers.skinport: skinport_client,
    Providers.skinbaron: skinbaron_client,
    Providers.steam: steam_client,
}
