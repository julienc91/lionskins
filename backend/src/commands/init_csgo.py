# -*- coding: utf-8 -*-

from ..init import sqlalchemy as db
from ..models.csgo import Weapon
from ..models.csgo.weapons import WEAPONS


class InitCSGO:

    @classmethod
    def run(cls):
        for category, weapons in WEAPONS.items():
            for name in weapons:
                Weapon.get_or_create(id=name, category=category)
            db.session.commit()
