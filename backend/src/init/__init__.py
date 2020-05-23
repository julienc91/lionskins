# -*- coding: utf-8 -*-

from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_mongoengine import MongoEngine
from flask_openid import OpenID


cors = CORS()
db = MongoEngine()
jwt = JWTManager()
oid = OpenID()
