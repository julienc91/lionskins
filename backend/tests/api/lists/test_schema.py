# -*- coding: utf-8 -*-

import json
from http import HTTPStatus

import pytest
from flask import url_for
from flask_jwt_extended import create_access_token
from graphql_relay.node.node import to_global_id
from slugify import slugify

from backend.src.models import List, User
from backend.src.models.csgo import Skin, Weapon
from backend.src.models.csgo.enums import Qualities, Weapons
from backend.src.models.lists import ItemContainer, Item


@pytest.fixture()
def user():
    return User.create(username="foo", password="password")


@pytest.fixture()
def access_token(user):
    return create_access_token(user.jwt_identity)


@pytest.fixture()
def skin():
    weapon = Weapon.create(name=Weapons.ak_47)
    return Skin.create(name="foo", weapon=weapon, souvenir=False, stat_trak=False, quality=Qualities.factory_new)


@pytest.fixture()
def list_(user, skin):
    list_ = List.create(user=user, name="Foo", slug="foo")
    for i in range(3):
        list_.item_containers.append(ItemContainer.create())
        for _ in range(i + 1):
            list_.item_containers[-1].items.append(Item(skin=skin))
    list_.save()
    return list_


# get current user lists

get_current_user_lists_query = """
    query {
        currentUserLists {
            edges {
                node {
                    id,
                    description,
                    name,
                    slug,
                    countItems,
                    creationDate,
                    updateDate
                }
            }
        }
    }
"""


@pytest.mark.parametrize("nb_lists", [0, 1, 3])
def test_get_current_user_lists(client, user, nb_lists, access_token):

    other_user = User.create(username="bar", password="password")
    List.create(user=other_user, name="Foo", slug="foo")
    for _ in range(nb_lists):
        List.create(user=user, name="Foo", slug="foo")
    assert List.filter(user=user).count() == nb_lists

    url = url_for("graphql")

    res = client.post(
        url,
        headers={"Authorization": f"Bearer {access_token}"},
        data=json.dumps({"query": get_current_user_lists_query}),
        content_type="application/json",
    )

    assert res.status_code == HTTPStatus.OK

    res = res.json
    assert res["data"]["currentUserLists"]

    lists = [edge["node"] for edge in res["data"]["currentUserLists"]["edges"]]
    assert len(lists) == nb_lists


def test_get_current_user_lists_invalid(client):
    url = url_for("graphql")

    res = client.post(url, data=json.dumps({"query": get_current_user_lists_query}), content_type="application/json")

    assert res.status_code == HTTPStatus.OK

    res = res.json
    assert not res["data"]["currentUserLists"]


#  get list

get_list_query = """
    query($id: ID!) {
        userList(id: $id) {
            id,
            description,
            name,
            slug,
            countItems,
            creationDate,
            updateDate,
            user {
                id,
                username
            }
        }
    }
"""


def test_get_list(client, list_):
    url = url_for("graphql")

    list_id = to_global_id("TypeList", list_.id)
    res = client.post(
        url, data=json.dumps({"query": get_list_query, "variables": {"id": list_id}}), content_type="application/json"
    )

    assert res.status_code == HTTPStatus.OK

    res = res.json
    assert res["data"]["userList"]
    assert res["data"]["userList"]["id"] == list_id
    assert res["data"]["userList"]["user"]["username"] == list_.user.username


def test_get_list_invalid(client):
    url = url_for("graphql")

    list_id = to_global_id("TypeList", "404")
    res = client.post(
        url, data=json.dumps({"query": get_list_query, "variables": {"id": list_id}}), content_type="application/json"
    )

    assert res.status_code == HTTPStatus.OK

    res = res.json
    assert not res["data"]["userList"]


# create list

create_list_query = """
    mutation($name: String!, $description: String) {
        createList(name: $name, description: $description) {
            list {
                id,
                description,
                name,
                slug,
                countItems,
                creationDate,
                updateDate
            }
        }
    }
"""


@pytest.mark.parametrize("name, description", [("foo", "bar"), ("foo", "")])
def test_create_list(client, user, access_token, name, description):

    url = url_for("graphql")

    res = client.post(
        url,
        headers={"Authorization": f"Bearer {access_token}"},
        data=json.dumps({"query": create_list_query, "variables": {"name": name, "description": description}}),
        content_type="application/json",
    )

    assert res.status_code == HTTPStatus.OK

    queryset = List.filter(user=user)
    assert queryset.count() == 1
    list_ = queryset.first()
    assert list_.user == user
    assert list_.name == name
    assert list_.slug == slugify(name)
    assert list_.description == description

    res = res.json
    assert res["data"]["createList"]["list"]
    assert res["data"]["createList"]["list"]["name"] == name


def test_create_list_not_authenticated(client):
    url = url_for("graphql")
    res = client.post(
        url,
        data=json.dumps({"query": create_list_query, "variables": {"name": "foo", "description": "bar"}}),
        content_type="application/json",
    )

    assert res.status_code == HTTPStatus.OK

    res = res.json
    assert not res["data"]["createList"]
    assert List.count() == 0


def test_create_list_invalid(client, access_token):
    url = url_for("graphql")
    res = client.post(
        url,
        headers={"Authorization": f"Bearer {access_token}"},
        data=json.dumps({"query": create_list_query, "variables": {"name": "", "description": "bar"}}),
        content_type="application/json",
    )

    assert res.status_code == HTTPStatus.OK

    res = res.json
    assert not res["data"]["createList"]
    assert List.count() == 0


# update list

update_list_query = """
    mutation($id: ID!, $name: String, $description: String) {
        updateList(id: $id, name: $name, description: $description) {
            list {
                id,
                description,
                name,
                slug,
                countItems,
                creationDate,
                updateDate
            }
        }
    }
"""


@pytest.mark.parametrize(
    "variables", [{}, {"name": ""}, {"name": "foo"}, {"name": "bar"}, {"description": "qux"}, {"description": ""}]
)
def test_update_list(client, list_, access_token, variables):
    url = url_for("graphql")

    list_id = to_global_id("TypeList", list_.id)
    res = client.post(
        url,
        headers={"Authorization": f"Bearer {access_token}"},
        data=json.dumps({"query": update_list_query, "variables": {"id": list_id, **variables}}),
        content_type="application/json",
    )

    assert res.status_code == HTTPStatus.OK

    res = res.json
    assert res["data"]["updateList"]["list"]

    updated_list = List.get(id=list_.id)
    if variables.get("name"):
        assert updated_list.name == variables["name"]
        assert updated_list.slug == slugify(variables["name"])
    else:
        assert updated_list.name == list_.name
        assert updated_list.slug == list_.slug

    if "description" in variables:
        assert updated_list.description == variables["description"]
    else:
        assert updated_list.description == list_.description


def test_update_list_not_authenticated(client, list_):
    url = url_for("graphql")

    list_id = to_global_id("TypeList", list_.id)
    res = client.post(
        url,
        data=json.dumps({"query": update_list_query, "variables": {"id": list_id, "name": "bar"}}),
        content_type="application/json",
    )

    assert res.status_code == HTTPStatus.OK

    res = res.json
    assert not res["data"]["updateList"]


def test_update_list_not_owner(client, list_, access_token):
    other_user = User.create(username="bar", password="password")
    list_.user = other_user
    list_.save()

    url = url_for("graphql")

    list_id = to_global_id("TypeList", list_.id)
    res = client.post(
        url,
        headers={"Authorization": f"Bearer {access_token}"},
        data=json.dumps({"query": update_list_query, "variables": {"id": list_id, "name": "bar"}}),
        content_type="application/json",
    )

    assert res.status_code == HTTPStatus.OK

    res = res.json
    assert not res["data"]["updateList"]


def test_update_list_invalid(client, list_, access_token):
    url = url_for("graphql")

    list_id = to_global_id("TypeList", "invalid_id")
    res = client.post(
        url,
        headers={"Authorization": f"Bearer {access_token}"},
        data=json.dumps({"query": update_list_query, "variables": {"id": list_id, "name": "bar"}}),
        content_type="application/json",
    )

    assert res.status_code == HTTPStatus.OK

    res = res.json
    assert not res["data"]["updateList"]


# delete list

delete_list_query = """
    mutation($id: ID!) {
        deleteList(id: $id) {
            ok
        }
    }
"""


def test_delete_list(client, list_, access_token):
    url = url_for("graphql")

    list_id = to_global_id("TypeList", list_.id)
    res = client.post(
        url,
        headers={"Authorization": f"Bearer {access_token}"},
        data=json.dumps({"query": delete_list_query, "variables": {"id": list_id}}),
        content_type="application/json",
    )

    assert res.status_code == HTTPStatus.OK

    res = res.json
    assert res["data"]["deleteList"]["ok"]

    assert List.count() == 0


def test_delete_list_not_authenticated(client, list_):
    url = url_for("graphql")

    list_id = to_global_id("TypeList", list_.id)
    res = client.post(
        url, data=json.dumps({"query": delete_list_query, "variables": {"id": list_id}}), content_type="application/json"
    )

    assert res.status_code == HTTPStatus.OK

    res = res.json
    assert not res["data"]["deleteList"]

    assert List.count() == 1


def test_delete_list_not_owner(client, list_, access_token):
    other_user = User.create(username="bar", password="password")
    list_.user = other_user
    list_.save()

    url = url_for("graphql")

    list_id = to_global_id("TypeList", list_.id)
    res = client.post(
        url,
        headers={"Authorization": f"Bearer {access_token}"},
        data=json.dumps({"query": delete_list_query, "variables": {"id": list_id}}),
        content_type="application/json",
    )

    assert res.status_code == HTTPStatus.OK

    res = res.json
    assert not res["data"]["deleteList"]


def test_delete_list_invalid(client, list_, access_token):
    url = url_for("graphql")

    list_id = to_global_id("TypeList", "invalid_id")
    res = client.post(
        url,
        headers={"Authorization": f"Bearer {access_token}"},
        data=json.dumps({"query": delete_list_query, "variables": {"id": list_id}}),
        content_type="application/json",
    )

    assert res.status_code == HTTPStatus.OK

    res = res.json
    assert not res["data"]["deleteList"]


# delete container

delete_container_query = """
    mutation($id: ID!, $containerId: Int!) {
        deleteContainer(id: $id, containerId: $containerId) {
            list {
                id,
                countItems
            }
        }
    }
"""


@pytest.mark.parametrize("container_id", [0, 1, 2])
def test_delete_container(client, list_, access_token, container_id):
    nb_containers = len(list_.item_containers)

    url = url_for("graphql")
    list_id = to_global_id("TypeList", list_.id)
    res = client.post(
        url,
        headers={"Authorization": f"Bearer {access_token}"},
        data=json.dumps({"query": delete_container_query, "variables": {"id": list_id, "containerId": container_id}}),
        content_type="application/json",
    )

    assert res.status_code == HTTPStatus.OK, res.json

    res = res.json
    assert res["data"]["deleteContainer"]["list"]["countItems"] == nb_containers - 1

    list_ = List.filter(id=list_.id).first()
    assert len(list_.item_containers) == nb_containers - 1
    for i, container in enumerate(list_.item_containers, start=1):
        if i <= container_id:
            assert len(container.items) == i
        else:
            assert len(container.items) == i + 1


# move container

move_container_query = """
    mutation($id: ID!, $containerId: Int!, $newContainerId: Int!) {
        moveContainer(id: $id, containerId: $containerId, newContainerId: $newContainerId) {
            list {
                id,
                countItems
            }
        }
    }
"""


@pytest.mark.parametrize("container_id, new_container_id", [(0, 0), (1, 1), (1, 0), (0, 1), (2, 0)])
def test_move_container(client, list_, access_token, container_id, new_container_id):
    nb_containers = len(list_.item_containers)

    url = url_for("graphql")
    list_id = to_global_id("TypeList", list_.id)
    res = client.post(
        url,
        headers={"Authorization": f"Bearer {access_token}"},
        data=json.dumps(
            {
                "query": move_container_query,
                "variables": {"id": list_id, "containerId": container_id, "newContainerId": new_container_id},
            }
        ),
        content_type="application/json",
    )

    assert res.status_code == HTTPStatus.OK, res.json

    res = res.json
    assert res["data"]["moveContainer"]["list"]["countItems"] == nb_containers

    list_ = List.filter(id=list_.id).first()
    assert len(list_.item_containers) == nb_containers
    for i, container in enumerate(list_.item_containers):
        if i < min(container_id, new_container_id):
            assert len(container.items) == i + 1
        elif i == new_container_id:
            assert len(container.items) == container_id + 1
