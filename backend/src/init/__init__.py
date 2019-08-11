# -*- coding: utf-8 -*-

from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_mongoengine import MongoEngine


cors = CORS()
db = MongoEngine()
jwt = JWTManager()
