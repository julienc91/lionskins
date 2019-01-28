# -*- coding: utf-8 -*-

import os
import sys
import logging

from flask_graphql import GraphQLView

from .application import app
from .api import schema
from .views.redirect import redirect_view


logging.basicConfig(level=logging.INFO)

sys.path.append(os.path.dirname(__file__))

app.add_url_rule('/graphql', view_func=GraphQLView.as_view('graphql', schema=schema, graphiql=True))
app.add_url_rule('/redirect/<provider>/<skin_id>/', view_func=redirect_view)
