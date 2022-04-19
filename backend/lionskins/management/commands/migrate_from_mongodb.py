import os

import bson
from django.core.management.base import BaseCommand
from django.utils.timezone import make_aware

from csgo.models import Price, Skin
from csgo.models.enums import Collections, Rarities, Types, Weapons
from lionskins.models.enums import Providers
from users.models import Contact, Redirect, User


class Command(BaseCommand):
    def add_arguments(self, parser):
        parser.add_argument("--path", required=True, type=str, help="Path to bson files")

    @staticmethod
    def get_enum_from_label(enum_type, label):
        if label is None:
            return None
        for enum_value in enum_type:
            if enum_value.label == label:
                return enum_value
        raise ValueError(f"No enum value found for label: {label}")

    def migrate_skins(self, path):
        with open(os.path.join(path, "skin.bson"), "rb") as f:
            data = bson.decode_file_iter(f)

            for skin in data:
                skin_obj, _ = Skin.objects.update_or_create(
                    object_id=str(skin["_id"]),
                    defaults=dict(
                        type=self.get_enum_from_label(Types, skin["type"]),
                        group_name=skin["name"],
                        group_slug=skin["slug"],
                        market_hash_name=skin["market_hash_name"],
                        creation_date=make_aware(skin["creation_date"]),
                        weapon=self.get_enum_from_label(Weapons, skin.get("weapon")),
                        stat_trak=skin.get("stat_trak"),
                        souvenir=skin.get("souvenir"),
                        quality=skin.get("quality"),
                        image_url=skin.get("image_url"),
                        rarity=self.get_enum_from_label(Rarities, skin.get("rarity")),
                        collection=self.get_enum_from_label(Collections, skin.get("collection")),
                        description=skin.get("description"),
                    ),
                )

                prices = []
                for price in skin.get("prices", []):
                    prices.append(
                        Price(
                            skin=skin_obj,
                            price=price["price"],
                            provider=self.get_enum_from_label(Providers, price["provider"]),
                            creation_date=make_aware(price["creation_date"]),
                            update_date=make_aware(price["update_date"]),
                        )
                    )
                Price.objects.bulk_create(prices, ignore_conflicts=True)

    def migrate_users(self, path):
        with open(os.path.join(path, "user.bson"), "rb") as f:
            data = bson.decode_file_iter(f)
            for user in data:
                user_obj, _ = User.objects.get_or_create(
                    steam_id=user["steam_id"],
                    defaults=dict(
                        username=user["username"],
                        date_joined=make_aware(user["creation_date"]),
                        last_login=make_aware(user["last_login"]),
                    ),
                )

    def migrate_redirects(self, path):
        with open(os.path.join(path, "redirect.bson"), "rb") as f:
            data = bson.decode_file_iter(f)
            for redirect in data:
                skin = Skin.objects.filter(object_id=str(redirect["skin"])).first()
                if not skin:
                    continue
                Redirect.objects.get_or_create(
                    skin=skin,
                    provider=self.get_enum_from_label(Providers, redirect["provider"]),
                    tracker=redirect.get("tracker", "")[:64],
                    creation_date=make_aware(redirect["creation_date"]),
                )

    def migrate_contacts(self, path):
        with open(os.path.join(path, "contact.bson"), "rb") as f:
            data = bson.decode_file_iter(f)
            for contact in data:
                Contact.objects.get_or_create(
                    name=contact.get("name", ""),
                    email=contact.get("email", ""),
                    message=contact["message"],
                    creation_date=make_aware(contact["creation_date"]),
                )

    def handle(self, *args, **options):
        path = options["path"]
        self.migrate_skins(path)
        self.migrate_users(path)
        self.migrate_redirects(path)
        self.migrate_contacts(path)
