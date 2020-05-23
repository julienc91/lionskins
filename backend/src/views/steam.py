# -*- coding: utf-8 -*-

import os
import re

from flask import redirect, request, session

from ..init import oid


def get_redirect_url(steam_id):
    redirect_path = session.get("open_id_redirect", "")
    if not redirect_path.startswith("/"):
        redirect_path = "/" + redirect_path
    return os.environ["FRONTEND_DOMAIN"] + redirect_path + f"?steam_id={steam_id}"


@oid.loginhandler
def steam_login():
    session["open_id_redirect"] = request.args.get("redirect")
    return oid.try_login("https://steamcommunity.com/openid")


@oid.after_login
def steam_login_callback(resp):
    steam_id_re = re.compile("steamcommunity.com/openid/id/(.*?)$")
    match = steam_id_re.search(resp.identity_url)
    steam_id = match.group(1)
    return redirect(get_redirect_url(steam_id))
