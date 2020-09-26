# -*- coding: utf-8 -*-

from flask import send_file

from ..commands.generate_sitemap import GenerateSitemap


def sitemap_view():
    return send_file(GenerateSitemap.output_file, mimetype="application/xml")
