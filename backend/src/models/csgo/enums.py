# -*- coding: utf-8 -*-

import enum


class Qualities(enum.Enum):
    factory_new = "Factory New"
    minimal_wear = "Minimal Wear"
    field_tested = "Field-Tested"
    well_worn = "Well-Worn"
    battle_scarred = "Battle-Scarred"

    @classmethod
    def from_int(cls, i):
        return {
            1: cls.factory_new,
            2: cls.minimal_wear,
            3: cls.field_tested,
            4: cls.well_worn,
            5: cls.battle_scarred,
        }[i]

    def to_int(self):
        return {
            self.factory_new: 1,
            self.minimal_wear: 2,
            self.field_tested: 3,
            self.well_worn: 4,
            self.battle_scarred: 5,
        }[self]


class Rarities(enum.Enum):
    consumer_grade = "Consumer Grade"
    industrial_grade = "Industrial Grade"
    mil_spec = "Mil-Spec"
    restricted = "Restricted"
    classified = "Classified"
    covert = "Covert"
    contraband = "Contraband"


class Categories(enum.Enum):
    pistols = "Pistols"
    heavy = "Heavy"
    smgs = "SMGs"
    rifles = "Rifles"
    knives = "Knives"


class Weapons(enum.Enum):
    glock_18 = "Glock-18"
    usp_s = "USP-S"
    p2000 = "P2000"
    p250 = "P250"
    cz75_auto = "CZ75-Auto"
    five_seven = "Five-SeveN"
    tec_9 = "Tec-9"
    dual_berettas = "Dual Berettas"
    desert_eagle = "Desert Eagle"
    r8_revolver = "R8 Revolver"

    sawed_off = "Sawed-Off"
    mag_7 = "MAG-7"
    nova = "Nova"
    xm1014 = "XM1014"
    m249 = "M249"
    negev = "Negev"

    mac_10 = "MAC-10"
    mp9 = "MP9"
    pp_bizon = "PP-Bizon"
    mp7 = "MP7"
    mp5_sd = "MP5-SD"
    ump_45 = "UMP-45"
    p90 = "P90"

    galil_ar = "Galil AR"
    famas = "FAMAS"
    ak_47 = "AK-47"
    m4a4 = "M4A4"
    m4a1_s = "M4A1-S"
    sg_553 = "SG 553"
    aug = "AUG"
    g3sg1 = "G3SG1"
    scar_20 = "SCAR-20"
    ssg_08 = "SSG 08"
    awp = "AWP"

    bayonet = "Bayonet"
    bowie_knife = "Bowie Knife"
    butterfly_knife = "Butterfly Knife"
    falchion_knife = "Falchion Knife"
    flip_knife = "Flip Knife"
    gut_knife = "Gut Knife"
    huntsman_knife = "Huntsman Knife"
    karambit = "Karambit"
    m9_bayonet = "M9 Bayonet"
    navaja_knife = "Navaja Knife"
    shadow_daggers = "Shadow Daggers"
    stiletto_knife = "Stiletto Knife"
    talon_knife = "Talon Knife"
    ursus_knife = "Ursus Knife"
