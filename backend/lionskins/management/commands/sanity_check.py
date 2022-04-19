from datetime import timedelta

import structlog
from django.core.management.base import BaseCommand
from django.utils import timezone

from csgo.models import Price, Skin
from csgo.models.enums import Qualities, WeaponCategories, Weapons

languages = ["en", "fr"]
logger = structlog.get_logger()


class Command(BaseCommand):
    @classmethod
    def check_skins(cls):
        skins = Skin.objects.all().iterator()
        for skin in skins:
            if not skin.description:
                skin.description = {}
            if not skin.group_name:
                logger.error("Missing name info", skin=skin)
            if not skin.weapon:
                logger.error("Missing weapon info", skin=skin)
            if skin.souvenir and skin.stat_trak:
                logger.error("Unexpected StatTrak with souvenir", skin=skin)

            if not skin.quality:
                logger.warning("Missing quality", skin=skin)
            if not skin.rarity and Weapons(skin.weapon).category != WeaponCategories.gloves:
                logger.warning("Missing rarity", skin=skin)
            elif skin.rarity and Weapons(skin.weapon).category == WeaponCategories.gloves:
                logger.warning("Rarity is set on glove skin", skin=skin)
            if not skin.image_url:
                logger.warning("Missing image", skin=skin)

            if len([1 for language in languages if skin.description.get(language)]) != len(languages):
                if skin.quality != Qualities.vanilla:
                    logger.warning("Missing description", skin=skin)

            duplicate_skins = Skin.objects.filter(
                group_name=skin.group_name,
                weapon=skin.weapon,
                stat_trak=skin.stat_trak,
                souvenir=skin.souvenir,
                quality=skin.quality,
            )
            if duplicate_skins.count() != 1:
                logger.error("Duplicated skin", skin=skin)

            similar_skins = Skin.objects.filter(group_name=skin.group_name, weapon=skin.weapon)
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

            for price in Price.objects.filter(update_date__lt=timezone.now() - timedelta(days=7)).select_related("skin"):
                logger.warning("Old price", skin=price.skin, provider=price.provider)

    def handle(self, *args, **options):
        self.check_skins()
