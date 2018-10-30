# -*- coding: utf-8 -*-

import os

from flask import Flask

from . import sqlalchemy, migrate, cors


def create_application():

    static_folder = os.path.join('..', 'static')
    template_folder = os.path.join('..', 'templates')

    application = Flask(__name__, static_folder=static_folder, template_folder=template_folder)
    application.config.update(
        DEBUG=os.environ.get('FLASK_DEBUG', False),
        SECRET_KEY=os.environ.get('FLASK_SECRET_KEY', ''),
        SQLALCHEMY_DATABASE_URI=os.environ['SQLALCHEMY_DATABASE_URI'],
        SQLALCHEMY_TRACK_MODIFICATIONS=False,
    )

    sqlalchemy.init_app(application)
    migrate.init_app(application, sqlalchemy)
    cors.init_app(application)

    sqlalchemy.create_all(app=application)

    return application
