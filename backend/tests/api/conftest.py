# -*- coding: utf-8 -*-

import pytest

from flask_mongoengine import MongoEngine


@pytest.fixture(autouse=True)
def app():
    from backend.src import app

    db = MongoEngine(app)
    ctx = app.app_context()
    ctx.push()

    yield app

    db.connection.drop_database("test")
    ctx.pop()
