# -*- coding: utf-8 -*-

from flask import abort, send_file

from ..commands.fetch_players import FetchPlayers


def teams_view():
    try:
        return send_file(FetchPlayers.output_file(), mimetype="application/json")
    except FileNotFoundError:
        return abort(404)
