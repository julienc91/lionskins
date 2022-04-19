from http import HTTPStatus

import pytest
from django.urls import reverse

from users.models import Contact

send_message_query = """
    mutation($name: String, $email: String, $message: String!, $captcha: String!) {
        contact(name: $name, email: $email, message: $message, captcha: $captcha)  {
            id
        }
    }
"""


@pytest.mark.parametrize("name", ["", "foo"])
@pytest.mark.parametrize("email", ["", "foo@bar.baz"])
@pytest.mark.parametrize("authenticated", [True, False])
@pytest.mark.django_db
def test_send_message(monkeypatch, client, user, name, email, authenticated):
    monkeypatch.setattr("users.serializers.contact.check_captcha", lambda *_: True)
    monkeypatch.setattr("users.models.contact.Contact.send", lambda *_: None)

    if authenticated:
        client.force_login(user)

    url = reverse("graphql")
    message = "message content"
    res = client.post(
        url,
        data={"query": send_message_query, "variables": {"name": name, "email": email, "message": message, "captcha": "captcha"}},
        content_type="application/json",
    )

    assert res.status_code == HTTPStatus.OK, res.content

    res = res.json()
    assert res["data"]["contact"]
    assert res["data"]["contact"]["id"]

    contact = Contact.objects.first()
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
@pytest.mark.django_db
def test_send_message_invalid_parameter(monkeypatch, client, captcha, email, message):
    monkeypatch.setattr("users.serializers.contact.check_captcha", lambda *_: captcha == "captcha")

    url = reverse("graphql")
    res = client.post(
        url,
        data={"query": send_message_query, "variables": {"email": email, "message": message, "captcha": captcha}},
        content_type="application/json",
    )

    assert res.status_code == HTTPStatus.OK, res.content

    res = res.json()
    assert not res["data"]["contact"]
