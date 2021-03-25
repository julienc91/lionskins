# -*- coding: utf-8 -*-
from models.enums import Apps

from .csgo import Parser


def get_parser(app: Apps):
    return {app.csgo: Parser}[app]
