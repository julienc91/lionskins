# -*- coding: utf-8 -*-

import json

from bs4 import BeautifulSoup

from ..models.csgo import Skin
from ..models.csgo.enums import Collections, Weapons


class SyncCatalog:
    @classmethod
    def run(cls, data_path):
        with open(data_path) as f:
            data = json.load(f)

        languages = ["fr", "en"]

        for weapon_name in data:
            for name in data[weapon_name]:
                entry = data[weapon_name][name]
                weapon = Weapons[weapon_name]

                collection = entry.get("collection")
                if collection:
                    collection = Collections[collection]

                skins = Skin.filter(weapon=weapon, name=name)
                for skin in skins:
                    if collection:
                        skin.collection = collection

                    if not skin.description:
                        skin.description = {}

                    for language in languages:
                        description = entry["weapon_description"][language] + " " + entry["skin_description"][language]
                        description = BeautifulSoup(description, "html.parser").text

                        skin.description[language] = description

                    skin.save()
