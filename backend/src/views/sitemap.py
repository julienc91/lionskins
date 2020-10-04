# -*- coding: utf-8 -*-

from flask import abort, send_file

from ..commands.generate_sitemap import GenerateSitemap


def sitemap_view():
    try:
        return send_file(GenerateSitemap.output_file(), mimetype="application/xml")
    except FileNotFoundError:
        return abort(404)
