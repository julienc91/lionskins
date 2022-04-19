from http import HTTPStatus

import pytest
from django.urls import reverse

get_current_user_query = """
    query {
        currentUser {
            id,
            username
        }
    }
"""


@pytest.mark.django_db
def test_get_current_user(client, user):
    url = reverse("graphql")
    client.force_login(user)
    res = client.post(url, data={"query": get_current_user_query})

    assert res.status_code == HTTPStatus.OK, res.content
    res = res.json()
    assert res["data"]["currentUser"]
    assert res["data"]["currentUser"]["username"] == user.username


@pytest.mark.django_db
def test_get_current_user_invalid(client):
    url = reverse("graphql")
    res = client.post(url, data={"query": get_current_user_query})

    assert res.status_code == HTTPStatus.OK, res.content
    res = res.json()
    assert not res["data"]["currentUser"]
