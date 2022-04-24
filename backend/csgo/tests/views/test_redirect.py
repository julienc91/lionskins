import uuid
from urllib.parse import unquote

import pytest
from graphql_relay import to_global_id

from lionskins.models.enums import Providers
from users.models import Redirect


@pytest.mark.django_db
class TestRedirectView:
    @pytest.fixture()
    def ensure_redirect_object(self, monkeypatch):
        monkeypatch.setattr(
            "csgo.views.redirect.should_create_redirect_object", lambda _: True
        )

    @pytest.mark.parametrize("provider", Providers.active())
    def test_redirect_view(self, ensure_redirect_object, client, provider, skin):
        """
        The redirect view redirects to the correct URL.
        """
        url_id = to_global_id("SkinNode", skin.id)
        res = client.get(f"/redirect/{provider.value}/{url_id}/")
        assert res.status_code == 302
        assert unquote(res.url) == unquote(skin.get_skin_url(provider))

        redirect = Redirect.objects.get()
        assert redirect.skin == skin
        assert redirect.provider == provider

    def test_redirect_view_invalid_provider(self, client, skin):
        """
        The redirect view returns a 404 if the provider is not valid.
        """
        url_id = to_global_id("SkinNode", skin.id)
        res = client.get(f"/redirect/invalid/{url_id}/")
        assert res.status_code == 404

    def test_redirect_view_invalid_skin(self, client):
        """
        The redirect view returns a 404 if the skin id is not a valid skin.
        """
        url_id = to_global_id("SkinNode", str(uuid.uuid4()))
        res = client.get(f"/redirect/{Providers.steam.value}/{url_id}/")
        assert res.status_code == 404

    def test_redirect_view_invalid_skin_id(self, client):
        """
        The redirect view returns a 404 if the skin id is not a valid skin.
        """
        res = client.get(f"/redirect/{Providers.steam.value}/whatever/")
        assert res.status_code == 404

    def test_redirect_view_object_id_fallback(
        self, ensure_redirect_object, client, skin
    ):
        """
        The redirect view uses the object id as fallback.
        """
        provider = Providers.steam
        skin.object_id = "legacyobjectid"
        skin.save()

        url_id = to_global_id("TypeCSGOSkin", skin.object_id)
        res = client.get(f"/redirect/{provider.value}/{url_id}/")
        assert res.status_code == 302
        assert unquote(res.url) == unquote(skin.get_skin_url(provider))

        redirect = Redirect.objects.get()
        assert redirect.skin == skin
        assert redirect.provider == provider
