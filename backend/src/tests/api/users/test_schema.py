# -*- coding: utf-8 -*-

from datetime import timedelta
from http import HTTPStatus

import pytest
from flask import url_for
from flask_jwt_extended import create_access_token, create_refresh_token, decode_token

# refresh token

refresh_token_query = """
    mutation {
        refreshToken {
            accessToken
        }
    }
"""


def test_refresh_token(client, user):
    url = url_for("graphql")
    refresh_token = create_refresh_token(user.jwt_identity)
    res = client.post(url, json={"query": refresh_token_query}, headers={"Authorization": f"Bearer {refresh_token}"})

    assert res.status_code == HTTPStatus.OK

    res = res.json
    assert res["data"]["refreshToken"]["accessToken"]
    assert decode_token(res["data"]["refreshToken"]["accessToken"])


@pytest.mark.parametrize(
    "refresh_token_generator",
    [
        lambda _: None,
        lambda _: "foo",
        lambda user: create_refresh_token(user.jwt_identity, timedelta(days=-1)),
        lambda user: create_refresh_token(user.jwt_identity + "_"),
        lambda user: create_access_token(user.jwt_identity),
    ],
)
def test_refresh_token_invalid(client, refresh_token_generator, user):
    url = url_for("graphql")
    refresh_token = refresh_token_generator(user)
    headers = {}
    if refresh_token:
        headers["Authentication"] = f"Bearer {refresh_token}"

    res = client.post(url, headers=headers, json={"query": refresh_token_query})

    assert res.status_code == HTTPStatus.OK
    res = res.json
    assert not res["data"]["refreshToken"]


# get current user

get_current_user_query = """
    query {
        currentUser {
            id,
            username
        }
    }
"""


def test_get_current_user(client, user):
    url = url_for("graphql")
    access_token = create_access_token(user.jwt_identity)

    res = client.post(url, headers={"Authorization": f"Bearer {access_token}"}, json={"query": get_current_user_query})

    assert res.status_code == HTTPStatus.OK
    res = res.json
    assert res["data"]["currentUser"]
    assert res["data"]["currentUser"]["username"] == user.username


@pytest.mark.parametrize(
    "access_token_generator",
    [
        lambda _: None,
        lambda _: "foo",
        lambda user: create_access_token(user.jwt_identity, timedelta(days=-1)),
        lambda user: create_access_token(user.jwt_identity + "_"),
        lambda user: create_refresh_token(user.jwt_identity),
    ],
)
def test_get_current_user_invalid(client, access_token_generator, user):
    url = url_for("graphql")
    access_token = access_token_generator(user)
    headers = {}
    if access_token:
        headers["Authentication"] = f"Bearer {access_token}"

    res = client.post(url, headers=headers, json={"query": get_current_user_query})

    assert res.status_code == HTTPStatus.OK
    res = res.json
    assert not res["data"]["currentUser"]
