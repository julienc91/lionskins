# -*- coding: utf-8 -*-

from flask_cors import CORS
from flask_mongoengine import MongoEngine


cors = CORS()
db = MongoEngine()
