# -*- coding: utf-8 -*-

from xml.dom.minidom import parseString

import pytest
from slugify import slugify

from commands import GenerateSitemap


@pytest.fixture(autouse=True)
def patch_output_file(monkeypatch, tmp_path):
    monkeypatch.setattr(GenerateSitemap, "output_file", lambda: str(tmp_path / "sitemap.xml"))


def test_generate_sitemap_static_urls(client, skin):
    res = GenerateSitemap.run()
    with open(GenerateSitemap.output_file()) as f:
        assert f.read() == res

    assert parseString(res)

    assert "<loc>https://lionskins.co/fr/faq</loc>" in res
    assert "<loc>https://lionskins.co/en/privacy-policy</loc>" in res

    weapon = slugify(skin.weapon.value)
    assert f"<loc>https://lionskins.co/fr/counter-strike-global-offensive/{weapon}/{skin.slug}</loc>" in res
    assert f"<loc>https://lionskins.co/en/counter-strike-global-offensive/{weapon}/{skin.slug}</loc>" in res

    res2 = client.get("/sitemap.xml")
    assert res2.status_code == 200
    assert res2.data.decode() == res
