# -*- coding: utf-8 -*-

import json
from datetime import timedelta
from http import HTTPStatus
from unittest.mock import MagicMock

import pytest
from flask import url_for
from flask_jwt_extended import create_access_token, create_refresh_token, decode_token

from backend.src.models import User


# create_user

create_user_query = """
    mutation($username: String!, $password: String!, $captcha: String!) {
        createUser(username: $username, password: $password, captcha: $captcha) {
            accessToken,
            refreshToken
        }
    }
"""


def test_create_user(monkeypatch, client):
    monkeypatch.setattr("backend.src.api.users.schema.check_captcha", MagicMock(return_value=True))
    url = url_for("graphql")

    username = "foo"
    password = "passw0rd"

    res = client.post(url, data=json.dumps({
        "query": create_user_query,
        "variables": {"username": username, "password": password, "captcha": "captcha"}
    }), content_type='application/json')

    assert res.status_code == HTTPStatus.OK

    res = res.json
    assert res['data']['createUser']['accessToken']
    assert res['data']['createUser']['refreshToken']

    assert User.count() == 1

    user = User.filter()[0]
    assert user.username == username
    assert user.password != password
    assert user.check_password(password)


@pytest.mark.parametrize("username, ok", [
    ("foo", False),
    ("Foo", True)
])
def test_create_user_existing_username(monkeypatch, client, username, ok):
    monkeypatch.setattr("backend.src.api.users.schema.check_captcha", MagicMock(return_value=True))
    url = url_for("graphql")

    User.create(username="foo", password="passw0rd")

    res = client.post(url, data=json.dumps({
        "query": create_user_query,
        "variables": {"username": username, "password": "passw0rd", "captcha": "captcha"}
    }), content_type='application/json')

    assert res.status_code == HTTPStatus.OK

    res = res.json
    if ok:
        assert res['data']['createUser']
    else:
        error_field = res['errors'][0]
        assert error_field['code'] == HTTPStatus.CONFLICT
        assert error_field['field'] == 'username'


def test_create_user_password_too_short(monkeypatch, client):
    monkeypatch.setattr("backend.src.api.users.schema.check_captcha", MagicMock(return_value=True))
    url = url_for("graphql")

    res = client.post(url, data=json.dumps({
        "query": create_user_query,
        "variables": {"username": "foo", "password": "123", "captcha": "captcha"}
    }), content_type='application/json')

    assert res.status_code == HTTPStatus.OK

    res = res.json
    error_field = res['errors'][0]
    assert error_field['code'] == HTTPStatus.BAD_REQUEST
    assert error_field['field'] == 'password'


def test_create_user_invalid_captcha(monkeypatch, client):
    monkeypatch.setattr("backend.src.api.users.schema.check_captcha", MagicMock(return_value=False))
    url = url_for("graphql")

    res = client.post(url, data=json.dumps({
        "query": create_user_query,
        "variables": {"username": "foo", "password": "passw0rd", "captcha": "bypass"}
    }), content_type='application/json')

    assert res.status_code == HTTPStatus.OK

    res = res.json
    error_field = res['errors'][0]
    assert error_field['code'] == HTTPStatus.BAD_REQUEST
    assert error_field['field'] == 'captcha'


# authentication

authenticate_query = """
    mutation($username: String!, $password: String!) {
        authenticate(username: $username, password: $password) {
            accessToken,
            refreshToken
        }
    }
"""


def test_authenticate(client):
    username = "foo"
    password = "passw0rd"
    User.create(username=username, password=password)

    url = url_for("graphql")
    res = client.post(url, data=json.dumps({
        "query": authenticate_query,
        "variables": {"username": username, "password": password}
    }), content_type='application/json')

    assert res.status_code == HTTPStatus.OK

    res = res.json
    assert res['data']['authenticate']['accessToken']
    assert res['data']['authenticate']['refreshToken']
    assert decode_token(res['data']['authenticate']['accessToken'])
    assert decode_token(res['data']['authenticate']['refreshToken'])


@pytest.mark.parametrize('username, password', [
    ('foo', 'invalid_password'),
    ('bar', 'password'),
    ('bar', 'invalid_password')
])
def test_authenticate_invalid_credentials(client, username, password):
    User.create(username="foo", password="password")

    url = url_for("graphql")
    res = client.post(url, data=json.dumps({
        "query": authenticate_query,
        "variables": {"username": username, "password": password}
    }), content_type='application/json')

    assert res.status_code == HTTPStatus.OK

    res = res.json
    assert not res['data']['authenticate']
    error_field = res['errors'][0]
    assert error_field['code'] == HTTPStatus.UNAUTHORIZED


# refresh token

refresh_token_query = """
    mutation {
        refreshToken {
            accessToken
        }
    }
"""


def test_refresh_token(client):
    user = User.create(username="foo", password="password")
    
    url = url_for("graphql")
    refresh_token = create_refresh_token(user.jwt_identity)
    res = client.post(url, data=json.dumps({
        "query": refresh_token_query,
    }), headers={
        "Authorization": f"Bearer {refresh_token}"
    }, content_type='application/json')

    assert res.status_code == HTTPStatus.OK

    res = res.json
    assert res['data']['refreshToken']['accessToken']
    assert decode_token(res['data']['refreshToken']['accessToken'])


@pytest.mark.parametrize("refresh_token_generator", [
    lambda _: None,
    lambda _: "foo",
    lambda user: create_refresh_token(user.jwt_identity, timedelta(days=-1)),
    lambda user: create_refresh_token(user.jwt_identity + "_"),
    lambda user: create_access_token(user.jwt_identity)
])
def test_refresh_token_invalid(client, refresh_token_generator):
    user = User.create(username="foo", password="password")
    
    url = url_for("graphql")
    refresh_token = refresh_token_generator(user)
    headers = {}
    if refresh_token:
        headers["Authentication"] = f"Bearer {refresh_token}"

    res = client.post(url, headers=headers, data=json.dumps({
        "query": refresh_token_query,
    }), content_type='application/json')

    assert res.status_code == HTTPStatus.OK
    res = res.json
    assert not res['data']['refreshToken']


# get current user

get_current_user_query = """
    query {
        currentUser {
            id,
            username
        }
    }
"""


def test_get_current_user(client):
    user = User.create(username="foo", password="password")

    url = url_for("graphql")
    access_token = create_access_token(user.jwt_identity)

    res = client.post(url, headers={
        "Authorization": f"Bearer {access_token}"
    }, data=json.dumps({
        "query": get_current_user_query,
    }), content_type='application/json')

    assert res.status_code == HTTPStatus.OK
    res = res.json
    assert res['data']['currentUser']
    assert res['data']['currentUser']['username'] == user.username


@pytest.mark.parametrize("access_token_generator", [
    lambda _: None,
    lambda _: "foo",
    lambda user: create_access_token(user.jwt_identity, timedelta(days=-1)),
    lambda user: create_access_token(user.jwt_identity + "_"),
    lambda user: create_refresh_token(user.jwt_identity)
])
def test_get_current_user_invalid(client, access_token_generator):
    user = User.create(username="foo", password="password")

    url = url_for("graphql")
    access_token = access_token_generator(user)
    headers = {}
    if access_token:
        headers["Authentication"] = f"Bearer {access_token}"

    res = client.post(url, headers=headers, data=json.dumps({
        "query": get_current_user_query,
    }), content_type='application/json')

    assert res.status_code == HTTPStatus.OK
    res = res.json
    assert not res['data']['currentUser']
