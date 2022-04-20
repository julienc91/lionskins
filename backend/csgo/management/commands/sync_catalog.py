import json

from bs4 import BeautifulSoup
from django.core.management.base import BaseCommand
from tqdm import tqdm

from csgo.models import Skin
from csgo.models.enums import Rarities, Types, WeaponCategories, Weapons


class Command(BaseCommand):
    map_csgo_weapon_to_enum = {
        "weapon_ak47": Weapons.ak_47,
        "weapon_awp": Weapons.awp,
        "weapon_aug": Weapons.aug,
        "weapon_bizon": Weapons.pp_bizon,
        "weapon_cz75a": Weapons.cz75_auto,
        "weapon_deagle": Weapons.desert_eagle,
        "weapon_elite": Weapons.dual_berettas,
        "weapon_famas": Weapons.famas,
        "weapon_fiveseven": Weapons.five_seven,
        "weapon_galilar": Weapons.galil_ar,
        "weapon_g3sg1": Weapons.g3sg1,
        "weapon_glock": Weapons.glock_18,
        "weapon_hkp2000": Weapons.p2000,
        "weapon_mac10": Weapons.mac_10,
        "weapon_mag7": Weapons.mag_7,
        "weapon_m249": Weapons.m249,
        "weapon_m4a1": Weapons.m4a4,
        "weapon_m4a1_silencer": Weapons.m4a1_s,
        "weapon_mp5sd": Weapons.mp5_sd,
        "weapon_mp7": Weapons.mp7,
        "weapon_mp9": Weapons.mp9,
        "weapon_negev": Weapons.negev,
        "weapon_nova": Weapons.nova,
        "weapon_p250": Weapons.p250,
        "weapon_p90": Weapons.p90,
        "weapon_revolver": Weapons.r8_revolver,
        "weapon_sawedoff": Weapons.sawed_off,
        "weapon_scar20": Weapons.scar_20,
        "weapon_sg556": Weapons.sg_553,
        "weapon_ssg08": Weapons.ssg_08,
        "weapon_tec9": Weapons.tec_9,
        "weapon_ump45": Weapons.ump_45,
        "weapon_usp_silencer": Weapons.usp_s,
        "weapon_xm1014": Weapons.xm1014,
        "studded_brokenfang_gloves": Weapons.broken_fang_gloves,
        "studded_hydra_gloves": Weapons.hydra_gloves,
        "studded_bloodhound_gloves": Weapons.bloodhound_gloves,
        "leather_handwraps": Weapons.hand_wraps,
        "motorcycle_gloves": Weapons.moto_gloves,
        "slick_gloves": Weapons.driver_gloves,
        "specialist_gloves": Weapons.specialist_gloves,
        "sporty_gloves": Weapons.sport_gloves,
        "weapon_bayonet": Weapons.bayonet,
        "weapon_knife_butterfly": Weapons.butterfly_knife,
        "weapon_knife_canis": Weapons.survival_knife,
        "weapon_knife_cord": Weapons.paracord_knife,
        "weapon_knife_css": Weapons.classic_knife,
        "weapon_knife_falchion": Weapons.falchion_knife,
        "weapon_knife_flip": Weapons.flip_knife,
        "weapon_knife_gut": Weapons.gut_knife,
        "weapon_knife_gypsy_jackknife": Weapons.navaja_knife,
        "weapon_knife_karambit": Weapons.karambit,
        "weapon_knife_m9_bayonet": Weapons.m9_bayonet,
        "weapon_knife_outdoor": Weapons.nomad_knife,
        "weapon_knife_push": Weapons.shadow_daggers,
        "weapon_knife_skeleton": Weapons.skeleton_knife,
        "weapon_knife_stiletto": Weapons.stiletto_knife,
        "weapon_knife_survival_bowie": Weapons.bowie_knife,
        "weapon_knife_tactical": Weapons.huntsman_knife,
        "weapon_knife_ursus": Weapons.ursus_knife,
        "weapon_knife_widowmaker": Weapons.talon_knife,
    }
    map_csgo_rarity_to_enum_default = {
        "common": Rarities.consumer_grade,
        "uncommon": Rarities.industrial_grade,
        "rare": Rarities.mil_spec,
        "mythical": Rarities.restricted,
        "legendary": Rarities.classified,
        "ancient": Rarities.covert,
        "immortal": Rarities.contraband,
    }
    map_csgo_rarity_to_enum_buffed = {
        "common": Rarities.industrial_grade,
        "uncommon": Rarities.mil_spec,
        "rare": Rarities.restricted,
        "mythical": Rarities.classified,
        "legendary": Rarities.covert,
        "ancient": Rarities.covert,
        "immortal": Rarities.contraband,
    }
    weapons_with_buffed_rarity = {
        Weapons.p2000,
        Weapons.m4a1_s,
        Weapons.m4a4,
        Weapons.usp_s,
        Weapons.ak_47,
        Weapons.desert_eagle,
        Weapons.glock_18,
        Weapons.awp,
    }

    def add_arguments(self, parser):
        parser.add_argument("--data-path", help="Path to data.json", required=True)

    def handle(self, *args, **options) -> None:
        data_path = options["data_path"]
        with open(data_path) as f:
            data = json.load(f)

        languages = {"en": "english", "fr": "french"}
        default_language = "en"

        for item in tqdm(data):
            if item["type"] not in (1, 2, 3, 4):
                continue

            update = {}
            name = item["name"][languages[default_language]]
            filters = {"name": name}

            if item["type"] == 2:  # agents
                filters["type"] = Types.agents
                update = {
                    "rarity": self.map_csgo_rarity_to_enum_default[item["rarity"]]
                }
                descriptions = {}
                for language in languages:
                    description = item["description"][languages[language]]
                    description = BeautifulSoup(description, "html.parser").text
                    descriptions[language] = description
                update["description"] = descriptions

            else:
                weapon = self.map_csgo_weapon_to_enum[item["weapon"]["id"]]
                filters["weapon"] = weapon
                if weapon.category not in [
                    WeaponCategories.gloves,
                    WeaponCategories.knives,
                ]:
                    mapping = (
                        self.map_csgo_rarity_to_enum_buffed
                        if weapon in self.weapons_with_buffed_rarity
                        else self.map_csgo_rarity_to_enum_default
                    )
                    update["rarity"] = mapping[item["rarity"]]
                elif weapon.category == WeaponCategories.knives:
                    update["rarity"] = Rarities.covert

                descriptions = {}
                for language in languages:
                    description = item["weapon"]["description"][languages[language]]
                    if item["description"][languages[language]]:
                        description += " " + item["description"][languages[language]]
                    description = BeautifulSoup(description, "html.parser").text
                    descriptions[language] = description
                update["description"] = descriptions

            Skin.objects.filter(**filters).update(**update)
