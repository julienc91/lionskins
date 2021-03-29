# -*- coding: utf-8 -*-

from pathlib import PurePath

import pytest

from commands.sync_catalog import SyncCatalog
from models.csgo import Skin
from models.csgo.enums import Qualities, Rarities, WeaponCategories, Weapons
from tests.factories import SkinFactory


def build_skin_serie(weapon: Weapons, name: str, stat_trak: bool = False, souvenir: bool = False):
    for quality in Qualities:
        SkinFactory(weapon=weapon, name=name, quality=quality, stat_trak=stat_trak, souvenir=souvenir, rarity=None)


@pytest.fixture
def skins():
    build_skin_serie(Weapons.ak_47, "Asiimov")
    build_skin_serie(Weapons.ak_47, "Asiimov", stat_trak=True)
    build_skin_serie(Weapons.awp, "Asiimov")
    build_skin_serie(Weapons.awp, "Asiimov", stat_trak=True)
    build_skin_serie(Weapons.awp, "Dragon Lore")
    build_skin_serie(Weapons.awp, "Dragon Lore", souvenir=True)
    build_skin_serie(Weapons.sawed_off, "Amber Fade")
    build_skin_serie(Weapons.sawed_off, "Apocalypto")
    build_skin_serie(Weapons.broken_fang_gloves, "Unhinged")
    build_skin_serie(Weapons.karambit, "Autotronic")


def test_sync_catalog(skins):
    dump_path = PurePath(__file__).parent / ".." / "assets" / "dump.json"
    SyncCatalog.run(dump_path)

    for skin in Skin.objects():
        if skin.name == "Amber Fade":
            assert not skin.rarity
            assert not skin.description
        else:
            assert skin.description["en"]
            assert skin.description["fr"]

            if skin.weapon.category is WeaponCategories.gloves:
                assert skin.rarity is None
            elif skin.weapon.category is WeaponCategories.knives:
                assert skin.rarity is Rarities.covert
            else:
                assert skin.rarity
