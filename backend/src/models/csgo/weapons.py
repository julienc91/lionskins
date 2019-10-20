# -*- coding: utf-8 -*-

from ...init import db
from ..model_mixin import ModelMixin
from .enums import Categories, Weapons


WEAPONS = {
    Categories.pistols: {
        Weapons.glock_18, Weapons.usp_s, Weapons.p2000, Weapons.p250, Weapons.cz75_auto, Weapons.five_seven,
        Weapons.tec_9, Weapons.dual_berettas, Weapons.desert_eagle, Weapons.r8_revolver
    },
    Categories.heavy: {
        Weapons.sawed_off, Weapons.mag_7, Weapons.nova, Weapons.xm1014, Weapons.m249, Weapons.negev
    },
    Categories.smgs: {
        Weapons.mac_10, Weapons.mp9, Weapons.pp_bizon, Weapons.mp7, Weapons.mp5_sd, Weapons.ump_45, Weapons.p90
    },
    Categories.rifles: {
        Weapons.galil_ar, Weapons.famas, Weapons.ak_47, Weapons.m4a4, Weapons.m4a1_s, Weapons.sg_553,
        Weapons.aug, Weapons.g3sg1, Weapons.scar_20, Weapons.ssg_08, Weapons.awp
    },
    Categories.knives: {
        Weapons.bayonet, Weapons.bowie_knife, Weapons.butterfly_knife, Weapons.classic_knife, Weapons.falchion_knife,
        Weapons.flip_knife, Weapons.gut_knife, Weapons.huntsman_knife, Weapons.karambit, Weapons.m9_bayonet,
        Weapons.navaja_knife, Weapons.shadow_daggers, Weapons.stiletto_knife, Weapons.talon_knife,
        Weapons.ursus_knife
    },
}


class Weapon(ModelMixin, db.Document):

    _name = db.StringField(db_field="name", choices=Weapons, primary_key=True)
    _category = db.StringField(db_field="category", choices=Categories)

    meta = {
        'indexes': ['_category']
    }

    def __repr__(self):
        return f'<Weapon name={self._name}>'

    def __str__(self):
        return f'<Weapon {self._name}>'

    @property
    def name(self):
        return Weapons[self._name]

    @name.setter
    def name(self, value):
        self._name = value.name

    @property
    def category(self):
        return Categories[self._category]

    @category.setter
    def category(self, value):
        self._category = value.name

    @classmethod
    def get(cls, **kwargs):
        try:
            return super().get(**kwargs)
        except cls.DoesNotExist:
            if 'name' not in kwargs:
                raise

            for category, weapons in WEAPONS.items():
                for weapon in weapons:
                    if weapon == kwargs['name']:
                        kwargs['category'] = category
                        break
            return cls.create(**kwargs)
