# -*- coding: utf-8 -*-

from commands.generate_sitemap import GenerateSitemap
from flask import abort, send_file


def sitemap_view():
    try:
        return send_file(GenerateSitemap.output_file(), mimetype="application/xml")
    except FileNotFoundError:
        return abort(404)
