# -*- coding: utf-8 -*-

import sys

from slugify import slugify

from ..models.csgo import Skin


class GenerateSitemap:

    base_urls = [
        ["https://lionskins.co/", "monthly", 0.9],
        ["https://lionskins.co/about/", "never", 0.3],
        ["https://lionskins.co/contact/", "never", 0.3],
        ["https://lionskins.co/faq/", "monthly", 0.3],
        ["https://lionskins.co/privacy-policy/", "never", 0.1],
        ["https://lionskins.co/counter-strike-global-offensive/", "daily", 1],
    ]

    @classmethod
    def run(cls, output=None):
        urls = [url for url in cls.base_urls]

        all_skins = Skin.objects.all()
        already_done = set()
        for skin in all_skins:
            weapon_slug = slugify(skin.weapon.name.value)
            url = f"https://lionskins.co/counter-strike-global-offensive/{weapon_slug}/{skin.slug}/"
            row = [url, "daily", 0.7]
            if url in already_done:
                continue

            already_done.add(url)
            urls.append(row)

        res = """<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">"""
        for url, frequency, priority in urls:
            res += f"""<url><loc>{url}</loc><changefreq>{frequency}</changefreq><priority>{priority}</priority></url>"""
        res += """</urlset>"""

        if not output:
            sys.stdout.write(res)
        else:
            with open(output, "w") as f:
                f.write(res)
        return res
