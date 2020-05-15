# -*- coding: utf-8 -*-

import logging
from datetime import datetime, timedelta

from ..models.csgo import Skin


class SanityCheck:
    @classmethod
    def check_skins(cls):
        skin_ids = [skin.id for skin in Skin.filter()]
        for skin_id in skin_ids:
            skin = Skin.get(id=skin_id)
            if not skin.name:
                logging.error(f"Missing name info on skin {skin}")
            if not skin.weapon:
                logging.error(f"Missing weapon info on skin {skin}")
            if skin.souvenir and skin.stat_trak:
                logging.error(f"Unexpected StatTrak with souvenir on skin {skin}")

            if not skin.quality:
                logging.warning(f"Missing quality on skin {skin}")
            if not skin.rarity:
                logging.warning(f"Missing rarity on skin {skin}")
            if not skin.image_url:
                logging.warning(f"Missing image on skin {skin}")

            price_providers = {price.provider for price in skin.prices}
            if len(price_providers) != len(skin.prices):
                logging.error(f"Duplicated provider prices on skin {skin}")

            for price in skin.prices:
                if not price.price or price.price < 0:
                    logging.error(f"Invalid price on skin {skin} for provider {price.provider}")
                if price.update_date < datetime.now() - timedelta(days=7):
                    logging.warning(f"Old price on skin {skin} for provider {price.provider}")

            if not skin.description or not skin.description["fr"] or not skin.description["en"]:
                logging.warning(f"Missing description on skin {skin}")

            duplicate_skins = Skin.filter(
                name=skin.name, weapon=skin.weapon, stat_trak=skin.stat_trak, souvenir=skin.souvenir, quality=skin.quality
            )
            if duplicate_skins.count() != 1:
                logging.error(f"Duplicated skin {skin}")

    @classmethod
    def run(cls):
        cls.check_skins()
