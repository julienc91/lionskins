# -*- coding: utf-8 -*-

import logging
import os
import sys

import sentry_sdk
from flask import Flask
from init import cors, db, jwt, oid
from sentry_sdk.integrations.flask import FlaskIntegration


def create_application():
    if os.environ.get("SENTRY_DSN"):
        sentry_sdk.init(dsn=os.environ["SENTRY_DSN"], integrations=[FlaskIntegration()])

    static_folder = os.path.join("..", "static")
    template_folder = os.path.join("..", "templates")

    application = Flask(__name__, static_folder=static_folder, template_folder=template_folder)
    try:
        application.config.update(
            DEBUG=os.environ.get("FLASK_DEBUG", False),
            SECRET_KEY=os.environ.get("FLASK_SECRET_KEY", ""),
            MONGODB_HOST=os.environ["MONGO_HOST"],
            SESSION_COOKIE_SECURE=not os.environ.get("FLASK_DEBUG", False),
            SESSION_COOKIE_HTTPONLY=True,
            SESSION_COOKIE_SAMESITE="Strict",
            JWT_REFRESH_TOKEN_EXPIRES=False,
        )
    except KeyError as e:
        logging.error(f"Bad configuration, some environment variables are not set: {e.args[0]}")
        sys.exit(2)

    db.init_app(application)
    cors.init_app(application, supports_credentials=True, origins=os.environ.get("FRONTEND_DOMAIN", "*"))
    jwt.init_app(application)
    oid.init_app(application)
    return application
