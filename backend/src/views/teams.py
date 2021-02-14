# -*- coding: utf-8 -*-

from commands.fetch_players import FetchPlayers
from flask import abort, send_file


def teams_view():
    try:
        return send_file(FetchPlayers.output_file(), mimetype="application/json")
    except FileNotFoundError:
        return abort(404)
