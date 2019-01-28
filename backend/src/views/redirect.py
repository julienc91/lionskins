# -*- coding: utf-8 -*-

from flask import redirect, request
from graphql_relay.node.node import from_global_id

from ..models import Skin, Providers, Redirect


def redirect_view(provider, skin_id):

    _, skin_id = from_global_id(skin_id)
    provider = Providers[provider]
    skin = Skin.objects.get(id=skin_id)

    tracker = request.args.get('src')

    Redirect(skin=skin, provider=provider, tracker=tracker)

    url = provider.get_skin_url(skin)
    return redirect(url, code=302)
