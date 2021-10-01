# -*- coding: utf-8 -*-

import os

from slugify import slugify

from models.csgo import Skin
from models.csgo.enums import Types
from utils.data import get_data_directory


class GenerateSitemap:

    base_url = "https://lionskins.co"
    languages = ["en", "fr"]
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

    @classmethod
    def run(cls):
        urls = [url for url in cls.static_pages]

        all_skins = Skin.objects.all()
        already_done = set()
        for skin in all_skins:
            if skin.type == Types.agents:
                weapon_slug = "agents"
            elif skin.type == Types.music_kits:
                weapon_slug = "music-kits"
            else:
                weapon_slug = slugify(skin.weapon.value)
            url = f"counter-strike-global-offensive/{weapon_slug}/{skin.slug}"
            row = [url, "daily", 0.7]
            if url in already_done:
                continue

            already_done.add(url)
            urls.append(row)

        res = """<?xml version="1.0" encoding="UTF-8"?>"""
        res += """<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">"""
        for url, frequency, priority in urls:
            for language in cls.languages:
                res += "<url>"
                res += f"<loc>{cls.base_url}/{language}/{url}</loc>"
                res += f"<changefreq>{frequency}</changefreq>"
                res += f"<priority>{priority}</priority>"
                for other_language in cls.languages:
                    res += f"""<xhtml:link rel="alternate" hreflang="{other_language}" """
                    res += f"""href="{cls.base_url}/{language}/{url}" />"""
                res += "</url>"
        res += "</urlset>"

        with open(cls.output_file(), "w") as f:
            f.write(res)
        return res
