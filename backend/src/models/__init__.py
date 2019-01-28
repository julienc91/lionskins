# -*- coding: utf-8 -*-

import os
import sys
import logging

import mongoengine

from .skins import Skin
from .prices import Price
from .contact import Contact
from .redirects import Redirect

from . import csgo
from . import enums
from .enums import Apps, Providers, Currencies

try:
    mongoengine.connect(
        db=os.environ['MONGO_DBNAME'],
        host=os.environ['MONGO_HOSTNAME'],
        port=int(os.environ['MONGO_PORT']),
    )
except KeyError as e:
    logging.error(f"Bad configuration, some environment variables are not set: {e.args[0]}")
    sys.exit(2)

__all__ = ['Apps', 'Providers', 'Currencies', 'Skin', 'Price', 'Contact', 'Redirect', 'csgo', 'enums']
