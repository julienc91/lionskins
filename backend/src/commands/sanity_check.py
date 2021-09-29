# -*- coding: utf-8 -*-

from datetime import datetime, timedelta

import structlog

from models.csgo import Skin
from models.csgo.enums import Qualities, WeaponCategories

languages = ["en", "fr"]
logger = structlog.get_logger()


class SanityCheck:
    @classmethod
    def check_skins(cls):
        skin_ids = [skin.id for skin in Skin.filter()]
        for skin_id in skin_ids:
            skin = Skin.get(id=skin_id)
            if not skin.description:
                skin.description = {}
            if not skin.name:
                logger.error(f"Missing name info on skin {skin}")
            if not skin.weapon:
                logger.error(f"Missing weapon info on skin {skin}")
            if skin.souvenir and skin.stat_trak:
                logger.error(f"Unexpected StatTrak with souvenir on skin {skin}")

            if not skin.quality:
                logger.warning(f"Missing quality on skin {skin}")
            if not skin.rarity and skin.weapon.category is not WeaponCategories.gloves:
                logger.warning(f"Missing rarity on skin {skin}")
            elif skin.rarity and skin.weapon.category is WeaponCategories.gloves:
                logger.warning(f"Rarity is set on glove skin {skin}")
            if not skin.image_url:
                logger.warning(f"Missing image on skin {skin}")

            price_providers = {price.provider for price in skin.prices}
            if len(price_providers) != len(skin.prices):
                logger.error(f"Duplicated provider prices on skin {skin}")

            for price in skin.prices:
                if not price.price or price.price < 0:
                    logger.error(f"Invalid price on skin {skin} for provider {price.provider}")
                if price.update_date < datetime.now() - timedelta(days=7):
                    logger.warning(f"Old price on skin {skin} for provider {price.provider}")

            if len([1 for language in languages if skin.description.get(language)]) != len(languages):
                if skin.quality is not Qualities.vanilla:
                    logger.warning(f"Missing description on skin {skin}")

            duplicate_skins = Skin.filter(
                name=skin.name, weapon=skin.weapon, stat_trak=skin.stat_trak, souvenir=skin.souvenir, quality=skin.quality
            )
            if duplicate_skins.count() != 1:
                logger.error(f"Duplicated skin {skin}")

            similar_skins = Skin.filter(name=skin.name, weapon=skin.weapon)
            for similar_skin in similar_skins:
                if similar_skin.id == skin.id:
                    continue
                if skin.rarity != similar_skin.rarity:
                    if not skin.rarity:
                        skin.rarity = similar_skin.rarity
                        skin.save()
                    else:
                        logger.error(f"Inconsistent skin rarity between {skin} and {similar_skin}")
                if not similar_skin.description:
                    continue
                for language in languages:
                    if skin.description.get(language) != similar_skin.description.get(language):
                        if not skin.description.get(language):
                            skin.description[language] = similar_skin.description[language]
                            skin.save()
                        else:
                            logger.error(f"Inconsistent skin description between {skin} and {similar_skin}")

    @classmethod
    def run(cls):
        cls.check_skins()
