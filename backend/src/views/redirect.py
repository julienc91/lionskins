# -*- coding: utf-8 -*-

import http

import user_agents
from flask import abort, redirect, request
from graphql_relay.node.node import from_global_id

from models import Providers, Redirect, Skin


def redirect_view(provider, skin_id):

    try:
        _, skin_id = from_global_id(skin_id)
        provider = Providers[provider]
        skin = Skin.objects.get(id=skin_id)
    except (ValueError, KeyError, Skin.DoesNotExist):
        return abort(404)

    tracker = request.args.get("src")

    user_agent = request.headers.get("User-Agent")
    if user_agent and not user_agents.parse(user_agent).is_bot:
        Redirect.objects.create(skin=skin, provider=provider, tracker=tracker)

    url = provider.get_skin_url(skin)
    return redirect(url, code=http.HTTPStatus.FOUND)
