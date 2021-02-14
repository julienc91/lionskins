# -*- coding: utf-8 -*-

import logging
import os
import sys

from graphql_server.flask import GraphQLView
from src.api import schema
from src.application import app
from src.views.authentication import get_tokens, logout, steam_login
from src.views.redirect import redirect_view
from src.views.sitemap import sitemap_view
from src.views.teams import teams_view

logging.basicConfig(level=logging.INFO)

sys.path.append(os.path.dirname(__file__))

app.add_url_rule("/graphql", view_func=GraphQLView.as_view("graphql", schema=schema.graphql_schema, graphiql=True))
app.add_url_rule("/redirect/<provider>/<skin_id>/", view_func=redirect_view)
app.add_url_rule("/sitemap.xml", view_func=sitemap_view, methods=["GET"])
app.add_url_rule("/teams.json", view_func=teams_view, methods=["GET"])
app.add_url_rule("/steam/login", view_func=steam_login)
app.add_url_rule("/rest/jwt/", view_func=get_tokens, methods=["POST"])
app.add_url_rule("/rest/jwt/", view_func=logout, methods=["DELETE"])
