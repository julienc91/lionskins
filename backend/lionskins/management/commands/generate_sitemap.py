import os

from django.core.management.base import BaseCommand
from slugify import slugify

from csgo.models import Skin
from csgo.models.enums import Types
from lionskins.utils.data import get_data_directory


class Command(BaseCommand):

    base_url = "https://lionskins.co"
    languages = ["en", "fr", "pl"]
    static_pages = [
        ["", "monthly", 0.9],
        ["about", "never", 0.3],
        ["contact", "never", 0.3],
        ["faq", "monthly", 0.3],
        ["privacy-policy", "never", 0.1],
        ["counter-strike-global-offensive", "daily", 1],
        ["counter-strike-global-offensive/my-inventory", "monthly", 0.1],
    ]

    @classmethod
    def output_file(cls) -> str:
        return os.path.join(get_data_directory(), "sitemap.xml")

    def handle(self, *args, **options):
        urls = [url for url in self.static_pages]

        all_skins = Skin.objects.all()
        already_done = set()
        for skin in all_skins:
            if skin.type == Types.weapons:
                weapon_slug = slugify(skin.weapon)
            else:
                weapon_slug = skin.get_type_display().lower().replace("_", "-")
            url = f"counter-strike-global-offensive/{weapon_slug}/{skin.group_slug}"
            row = [url, "daily", 0.7]
            if url in already_done:
                continue

            already_done.add(url)
            urls.append(row)

        res = """<?xml version="1.0" encoding="UTF-8"?>"""
        res += """<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">"""
        for url, frequency, priority in urls:
            for language in self.languages:
                res += "<url>"
                res += f"<loc>{self.base_url}/{language}/{url}</loc>"
                res += f"<changefreq>{frequency}</changefreq>"
                res += f"<priority>{priority}</priority>"
                for other_language in self.languages:
                    res += (
                        f"""<xhtml:link rel="alternate" hreflang="{other_language}" """
                    )
                    res += f"""href="{self.base_url}/{language}/{url}" />"""
                res += "</url>"
        res += "</urlset>"

        with open(self.output_file(), "w") as f:
            f.write(res)
        return res
