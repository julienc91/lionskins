# -*- coding: utf-8 -*-

import os
import json

from bs4 import BeautifulSoup

from ..models.csgo import Skin, Weapon
from ..models.csgo.enums import Collections, Weapons


class SyncCatalog:
    @classmethod
    def run(cls):
        data_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "data", "csgo.json"))
        with open(data_path) as f:
            data = json.load(f)

        languages = ["fr", "en"]

        for entry in data:
            name, weapon = entry["name"], entry["weapon"]

            weapon = Weapons(weapon)
            weapon = Weapon.get(name=weapon)

            collection = entry["collection"] or None
            if collection:
                collection = Collections[collection]

            skins = Skin.filter(weapon=weapon, name=name)
            for skin in skins:
                if skin.collection and (not collection or collection != skin.collection):
                    input(f"Check collection: {skin.collection} - {collection}")
                skin.collection = collection

                if not skin.description:
                    skin.description = {}

                for language in languages:
                    description = entry[f"description_{language}"]
                    description = BeautifulSoup(description, "html.parser").text
                    if skin.description and skin.description.get(language) and skin.description[language] != description:
                        input(f"Check description_{language}:\nOld: {skin.description[language]}\nNew: {description}")

                    skin.description[language] = description

                skin.save()
