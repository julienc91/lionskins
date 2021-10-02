# -*- coding: utf-8 -*-

import enum


class Qualities(enum.Enum):
    vanilla = "Vanilla"
    factory_new = "Factory New"
    minimal_wear = "Minimal Wear"
    field_tested = "Field-Tested"
    well_worn = "Well-Worn"
    battle_scarred = "Battle-Scarred"

    @classmethod
    def from_int(cls, i: int) -> "Qualities":
        return {
            0: cls.vanilla,
            1: cls.factory_new,
            2: cls.minimal_wear,
            3: cls.field_tested,
            4: cls.well_worn,
            5: cls.battle_scarred,
        }[i]

    def to_int(self) -> int:
        return {
            self.vanilla: 0,
            self.factory_new: 1,
            self.minimal_wear: 2,
            self.field_tested: 3,
            self.well_worn: 4,
            self.battle_scarred: 5,
        }[self]


class Collections(enum.Enum):
    alpha = "The Alpha Collection"
    arms_deal = "The Arms Deal Collection"
    arms_deal_2 = "The Arms Deal 2 Collection"
    arms_deal_3 = "The Arms Deal 3 Collection"
    assault = "The Assault Collection"
    aztec = "The Aztec Collection"
    baggage = "The Baggage Collection"
    bank = "The Bank Collection"
    blacksite = "The Blacksite Collection"
    bravo = "The Bravo Collection"
    breakout = "The Breakout Collection"
    cache = "The Cache Collection"
    chop_shop = "The Chop Shop Collection"
    chroma = "The Chroma Collection"
    chroma_2 = "The Chroma 2 Collection"
    chroma_3 = "The Chroma 3 Collection"
    clutch = "The Clutch Collection"
    cobblestone = "The Cobblestone Collection"
    cs20 = "The CS20 Collection"
    danger_zone = "The Danger Zone Collection"
    dust = "The Dust Collection"
    dust2 = "The Dust 2 Collection"
    esports_2013 = "The eSports 2013 Collection"
    esports_2013_winter = "The eSports 2013 Winter Collection"
    esports_2014_summer = "The eSports 2014 Summer Collection"
    falchion = "The Falchion Collection"
    gamma = "The Gamma Collection"
    gamma_2 = "The Gamma 2 Collection"
    glove = "The Glove Collection"
    gods_and_monsters = "The Gods and Monsters Collection"
    horizon = "The Horizon Collection"
    huntsman = "The Huntsman Collection"
    hydra = "The Operation Hydra Collection"
    inferno = "The Inferno Collection"
    inferno_2018 = "The 2018 Inferno Collection"
    italy = "The Italy Collection"
    lake = "The Lake Collection"
    militia = "The Militia Collection"
    mirage = "The Mirage Collection"
    nuke = "The Nuke Collection"
    nuke_2018 = "The 2018 Nuke Collection"
    office = "The Office Collection"
    overpass = "The Overpass Collection"
    phoenix = "The Phoenix Collection"
    prisma = "The Prisma Collection"
    revolver = "The Revolver Case Collection"
    rising_sun = "The Rising Sun Collection"
    safehouse = "The Safehouse Collection"
    shadow = "The Shadow Collection"
    spectrum = "The Spectrum Collection"
    spectrum_2 = "The Spectrum 2 Collection"
    train = "The Train Collection"
    vanguard = "The Vanguard Collection"
    vertigo = "The Vertigo Collection"
    wildfire = "The Wildfire Collection"
    winter_offensive = "The Winter Offensive Collection"
    xray = "The X-Ray Collection"


class Rarities(enum.Enum):
    consumer_grade = "Consumer Grade"
    industrial_grade = "Industrial Grade"
    mil_spec = "Mil-Spec"
    restricted = "Restricted"
    classified = "Classified"
    covert = "Covert"
    contraband = "Contraband"


class Types(enum.Enum):
    weapons = "Weapons"
    agents = "Agents"
    music_kits = "Music Kits"
    graffitis = "Graffitis"
    stickers = "Stickers"


class WeaponCategories(enum.Enum):
    pistols = "Pistols"
    heavy = "Heavy"
    smgs = "SMGs"
    rifles = "Rifles"
    knives = "Knives"
    gloves = "Gloves"


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
    classic_knife = "Classic Knife"
    falchion_knife = "Falchion Knife"
    flip_knife = "Flip Knife"
    gut_knife = "Gut Knife"
    huntsman_knife = "Huntsman Knife"
    karambit = "Karambit"
    m9_bayonet = "M9 Bayonet"
    navaja_knife = "Navaja Knife"
    nomad_knife = "Nomad Knife"
    paracord_knife = "Paracord Knife"
    shadow_daggers = "Shadow Daggers"
    skeleton_knife = "Skeleton Knife"
    stiletto_knife = "Stiletto Knife"
    survival_knife = "Survival Knife"
    talon_knife = "Talon Knife"
    ursus_knife = "Ursus Knife"

    bloodhound_gloves = "Bloodhound Gloves"
    broken_fang_gloves = "Broken Fang Gloves"
    driver_gloves = "Driver Gloves"
    hand_wraps = "Hand Wraps"
    hydra_gloves = "Hydra Gloves"
    moto_gloves = "Moto Gloves"
    specialist_gloves = "Specialist Gloves"
    sport_gloves = "Sport Gloves"

    @classmethod
    def by_category(cls, category: WeaponCategories) -> list["Weapons"]:
        return _categories_to_weapons[category]

    @property
    def category(self) -> WeaponCategories:
        return _weapon_to_category[self]


_categories_to_weapons = {
    WeaponCategories.pistols: [
        Weapons.glock_18,
        Weapons.usp_s,
        Weapons.p2000,
        Weapons.p250,
        Weapons.cz75_auto,
        Weapons.five_seven,
        Weapons.tec_9,
        Weapons.dual_berettas,
        Weapons.desert_eagle,
        Weapons.r8_revolver,
    ],
    WeaponCategories.heavy: [Weapons.sawed_off, Weapons.mag_7, Weapons.nova, Weapons.xm1014, Weapons.m249, Weapons.negev],
    WeaponCategories.smgs: [
        Weapons.mac_10,
        Weapons.mp9,
        Weapons.pp_bizon,
        Weapons.mp7,
        Weapons.mp5_sd,
        Weapons.ump_45,
        Weapons.p90,
    ],
    WeaponCategories.rifles: [
        Weapons.galil_ar,
        Weapons.famas,
        Weapons.ak_47,
        Weapons.m4a4,
        Weapons.m4a1_s,
        Weapons.sg_553,
        Weapons.aug,
        Weapons.g3sg1,
        Weapons.scar_20,
        Weapons.ssg_08,
        Weapons.awp,
    ],
    WeaponCategories.knives: [
        Weapons.bayonet,
        Weapons.bowie_knife,
        Weapons.butterfly_knife,
        Weapons.classic_knife,
        Weapons.falchion_knife,
        Weapons.flip_knife,
        Weapons.gut_knife,
        Weapons.huntsman_knife,
        Weapons.karambit,
        Weapons.m9_bayonet,
        Weapons.navaja_knife,
        Weapons.nomad_knife,
        Weapons.paracord_knife,
        Weapons.shadow_daggers,
        Weapons.skeleton_knife,
        Weapons.stiletto_knife,
        Weapons.survival_knife,
        Weapons.talon_knife,
        Weapons.ursus_knife,
    ],
    WeaponCategories.gloves: [
        Weapons.bloodhound_gloves,
        Weapons.broken_fang_gloves,
        Weapons.driver_gloves,
        Weapons.hand_wraps,
        Weapons.hydra_gloves,
        Weapons.moto_gloves,
        Weapons.specialist_gloves,
        Weapons.sport_gloves,
    ],
}

_weapon_to_category = {weapon: category for category, weapons in _categories_to_weapons.items() for weapon in weapons}
