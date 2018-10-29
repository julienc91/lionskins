# -*- coding: utf-8 -*-

from flask_jwt_extended import JWTManager
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS


sqlalchemy = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()
cors = CORS()
