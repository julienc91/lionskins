# -*- coding: utf-8 -*-

import logging

from api import schema
from application import app
from graphql_server.flask import GraphQLView
from views.authentication import get_tokens, logout, steam_login
from views.redirect import redirect_view
from views.sitemap import sitemap_view
from views.teams import teams_view

logging.basicConfig(level=logging.INFO)

try:
    app.add_url_rule("/graphql", view_func=GraphQLView.as_view("graphql", schema=schema.graphql_schema, graphiql=True))
    app.add_url_rule("/redirect/<provider>/<skin_id>/", view_func=redirect_view)
    app.add_url_rule("/sitemap.xml", view_func=sitemap_view, methods=["GET"])
    app.add_url_rule("/teams.json", view_func=teams_view, methods=["GET"])
    app.add_url_rule("/steam/login", view_func=steam_login)
    app.add_url_rule("/rest/jwt/", view_func=get_tokens, methods=["POST"])
    app.add_url_rule("/rest/jwt/", view_func=logout, methods=["DELETE"])
except AssertionError:
    pass


import commands  # noqa
