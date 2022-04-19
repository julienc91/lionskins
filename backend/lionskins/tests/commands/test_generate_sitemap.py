from xml.dom.minidom import parseString

import pytest
from django.core.management import call_command
from slugify import slugify

from lionskins.management.commands.generate_sitemap import Command


@pytest.fixture(autouse=True)
def patch_output_file(monkeypatch, tmp_path):
    monkeypatch.setattr(Command, "output_file", lambda *_: str(tmp_path / "sitemap.xml"))


@pytest.mark.django_db
def test_generate_sitemap_static_urls(client, skin):
    res = call_command("generate_sitemap")
    with open(Command.output_file()) as f:
        assert f.read() == res

    assert parseString(res)

    assert "<loc>https://lionskins.co/fr/faq</loc>" in res
    assert "<loc>https://lionskins.co/en/privacy-policy</loc>" in res

    weapon = slugify(skin.weapon.value)
    assert f"<loc>https://lionskins.co/fr/counter-strike-global-offensive/{weapon}/{skin.group_slug}</loc>" in res
    assert f"<loc>https://lionskins.co/en/counter-strike-global-offensive/{weapon}/{skin.group_slug}</loc>" in res

    res2 = client.get("/sitemap.xml")
    assert res2.status_code == 200
    assert res2.content.decode() == res
