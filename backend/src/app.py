# -*- coding: utf-8 -*-

import os
import sys
import logging

from flask_graphql import GraphQLView

from .application import app
from .api import schema
from .views.authentication import get_tokens, logout, steam_login
from .views.redirect import redirect_view


logging.basicConfig(level=logging.INFO)

sys.path.append(os.path.dirname(__file__))

app.add_url_rule("/graphql", view_func=GraphQLView.as_view("graphql", schema=schema, graphiql=True))
app.add_url_rule("/redirect/<provider>/<skin_id>/", view_func=redirect_view)
app.add_url_rule("/steam/login", view_func=steam_login)
app.add_url_rule("/rest/jwt/", view_func=get_tokens, methods=["POST"])
app.add_url_rule("/rest/jwt/", view_func=logout, methods=["DELETE"])
