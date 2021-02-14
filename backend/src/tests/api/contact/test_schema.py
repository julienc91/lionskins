# -*- coding: utf-8 -*-

from http import HTTPStatus

import pytest
from flask import url_for
from flask_jwt_extended import create_access_token
from models import Contact, User


@pytest.fixture()
def user():
    return User.create(username="foo", steam_id="foo")


@pytest.fixture()
def access_token(user):
    return create_access_token(user.jwt_identity)


send_message_query = """
    mutation($name: String, $email: String, $message: String!, $captcha: String!) {
        contact(name: $name, email: $email, message: $message, captcha: $captcha)  {
            id
        }
    }
"""


@pytest.mark.parametrize("name", [None, "foo"])
@pytest.mark.parametrize("email", [None, "foo@bar.baz"])
@pytest.mark.parametrize("authenticated", [True, False])
def test_send_message(monkeypatch, client, access_token, user, name, email, authenticated):
    monkeypatch.setattr("api.contact.schema.check_captcha", lambda *_: True)

    url = url_for("graphql")
    message = "message content"
    headers = {"Authorization": f"Bearer {access_token}"} if authenticated else None
    res = client.post(
        url,
        headers=headers,
        json={"query": send_message_query, "variables": {"name": name, "email": email, "message": message, "captcha": "captcha"}},
    )

    assert res.status_code == HTTPStatus.OK

    res = res.json
    assert res["data"]["contact"]
    assert res["data"]["contact"]["id"]

    contact = Contact.filter()[0]
    assert contact
    assert contact.name == name
    assert contact.email == email
    assert contact.message == message
    assert contact.user == (user if authenticated else None)
    assert contact.creation_date


@pytest.mark.parametrize(
    "message, email, captcha",
    [("", "", "captcha"), ("foo", "", "bad_captcha"), ("foo", "bar", "captcha")],  # empty message  # bad captcha  # bad email
)
def test_send_message_invalid_parameter(monkeypatch, client, captcha, email, message):
    monkeypatch.setattr("api.contact.schema.check_captcha", lambda *_: captcha == "captcha")

    url = url_for("graphql")
    res = client.post(
        url, json={"query": send_message_query, "variables": {"email": email, "message": message, "captcha": "captcha"}}
    )

    assert res.status_code == HTTPStatus.OK

    res = res.json
    assert not res["data"]["contact"]
