# -*- coding: utf-8 -*-

from ...init import sqlalchemy as db
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
        Weapons.bayonet, Weapons.bowie_knife, Weapons.butterfly_knife, Weapons.falchion_knife,
        Weapons.flip_knife, Weapons.gut_knife, Weapons.huntsman_knife, Weapons.karambit, Weapons.m9_bayonet,
        Weapons.navaja_knife, Weapons.shadow_daggers, Weapons.stiletto_knife, Weapons.talon_knife,
        Weapons.ursus_knife
    },
}


class Weapon(ModelMixin, db.Model):

    __tablename__ = 'csgo_weapons'

    id = db.Column(db.Enum(Weapons, name="type_csgo_weapons"), primary_key=True)
    category = db.Column(db.Enum(Categories, name="type_csgo_categories"), index=True)

    @property
    def name(self):
        return self.id.value
