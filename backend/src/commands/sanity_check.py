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
                logger.error("Missing name info", skin=skin)
            if not skin.weapon:
                logger.error("Missing weapon info", skin=skin)
            if skin.souvenir and skin.stat_trak:
                logger.error("Unexpected StatTrak with souvenir", skin=skin)

            if not skin.quality:
                logger.warning("Missing quality", skin=skin)
            if not skin.rarity and skin.weapon.category is not WeaponCategories.gloves:
                logger.warning("Missing rarity", skin=skin)
            elif skin.rarity and skin.weapon.category is WeaponCategories.gloves:
                logger.warning("Rarity is set on glove skin", skin=skin)
            if not skin.image_url:
                logger.warning("Missing image", skin=skin)

            price_providers = {price.provider for price in skin.prices}
            if len(price_providers) != len(skin.prices):
                logger.error("Duplicated provider prices", skin=skin)

            for price in skin.prices:
                if not price.price or price.price < 0:
                    logger.error("Invalid price", skin=skin, provider=price.provider)
                if price.update_date < datetime.now() - timedelta(days=7):
                    logger.warning("Old price", skin=skin, provider=price.provider)

            if len([1 for language in languages if skin.description.get(language)]) != len(languages):
                if skin.quality is not Qualities.vanilla:
                    logger.warning("Missing description", skin=skin)

            duplicate_skins = Skin.filter(
                name=skin.name, weapon=skin.weapon, stat_trak=skin.stat_trak, souvenir=skin.souvenir, quality=skin.quality
            )
            if duplicate_skins.count() != 1:
                logger.error("Duplicated skin", skin=skin)

            similar_skins = Skin.filter(name=skin.name, weapon=skin.weapon)
            for similar_skin in similar_skins:
                if similar_skin.id == skin.id:
                    continue
                if skin.rarity != similar_skin.rarity:
                    if not skin.rarity:
                        skin.rarity = similar_skin.rarity
                        skin.save()
                    else:
                        logger.error("Inconsistent skin rarity", skin1=skin, skin2=similar_skin)
                if not similar_skin.description:
                    continue
                for language in languages:
                    if skin.description.get(language) != similar_skin.description.get(language):
                        if not skin.description.get(language):
                            skin.description[language] = similar_skin.description[language]
                            skin.save()
                        else:
                            logger.error("Inconsistent skin description", skin1=skin, skin2=similar_skin)

    @classmethod
    def run(cls):
        cls.check_skins()
