# -*- coding: utf-8 -*-

from flask import redirect, request
from graphql_relay.node.node import from_global_id

from ..init import sqlalchemy as db
from ..models import Skin, Provider, Redirect


def redirect_view(provider, skin_id):

    _, skin_id = from_global_id(skin_id)
    provider = Provider.query.get(provider)
    skin = Skin.query.get(skin_id)

    tracker = request.args.get('src')

    Redirect(skin=skin, provider=provider, tracker=tracker)
    db.session.commit()

    url = provider.get_skin_url(skin)
    return redirect(url, code=302)
