# -*- coding: utf-8 -*-

import os
import re

import requests
from flask import jsonify, redirect, session
from flask_jwt_extended import create_access_token, create_refresh_token
from src.init import oid
from src.models import User


@oid.loginhandler
def steam_login():
    session.pop("user_id", None)
    return oid.try_login("https://steamcommunity.com/openid")


@oid.after_login
def steam_login_callback(resp):
    steam_id_re = re.compile("steamcommunity.com/openid/id/(.*?)$")
    match = steam_id_re.search(resp.identity_url)
    steam_id = match.group(1)
    if not steam_id:
        return

    api_key = os.environ["STEAM_API_KEY"]
    res = requests.get(
        "https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/", {"key": api_key, "steamids": steam_id}
    )

    try:
        res = res.json()
        username = res["response"]["players"][0]["personaname"]
    except (ValueError, TypeError, KeyError, IndexError):
        username = None

    try:
        user = User.get(steam_id=steam_id)
    except User.DoesNotExist:
        user = None
    if user and username and user.username != username:
        user.username = username

    if not user:
        user = User.create(steam_id=steam_id, username=(username or "-"))
    else:
        user.set_last_login()

    session["user_id"] = str(user.id)
    return redirect(os.environ["FRONTEND_DOMAIN"] + "/authentication")


def get_tokens():
    user_id = session.get("user_id")
    if not user_id:
        return jsonify(), 401

    try:
        user = User.get(id=user_id)
    except User.DoesNotExist:
        return jsonify(), 401

    access_token = create_access_token(identity=user.jwt_identity)
    refresh_token = create_refresh_token(identity=user.jwt_identity)
    user.set_last_login()
    return jsonify(accessToken=access_token, refreshToken=refresh_token)


def logout():
    if session.get("user_id"):
        session["user_id"] = None
    return jsonify()
