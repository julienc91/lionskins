# -*- coding: utf-8 -*-

from flask_caching import Cache
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_mongoengine import MongoEngine
from flask_openid import OpenID

cache = Cache()
cors = CORS()
db = MongoEngine()
jwt = JWTManager()
oid = OpenID()
