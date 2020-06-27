# -*- coding: utf-8 -*-

import json
import re
import sys

import requests
from bs4 import BeautifulSoup


class FetchPlayers:
    @classmethod
    def _get_soup(cls, url: str) -> BeautifulSoup:
        res = requests.get(url)
        assert res.status_code == 200, (res.status_code, url)

        html = res.content
        return BeautifulSoup(html, features="html.parser")

    @classmethod
    def _get_top_teams(cls):
        soup = cls._get_soup("https://www.hltv.org/ranking/teams/")

        for div in soup.select(".ranking .ranked-team"):
            yield div.select_one(".ranking-header .name").text

    @classmethod
    def _get_players(cls, team: str):
        team = {"Spirit": "Team Spirit", "Hard Legion": "Hard Legion Esports", "Nemiga": "Nemiga Gaming"}.get(team, team)

        soup = cls._get_soup(f"https://liquipedia.net/counterstrike/{team}")
        container = soup.select_one(".table-responsive")
        for tr in container.select("tbody tr"):
            td = tr.select_one("td:nth-of-type(2)")
            if not td:
                continue

            player_name = td.text.strip()
            if " (Coach)" in player_name:
                continue

            player_name = re.sub(r" \(.*\)$", "", player_name)

            url = td.select_one("a")["href"]

            td = tr.select_one("td:nth-of-type(1)")
            country_image = td.select_one("img")["src"]
            country = country_image.split("/")[-1][:2].lower()

            yield player_name, country, url

    @classmethod
    def _get_steam_id(cls, url: str) -> str:
        soup = cls._get_soup("https://liquipedia.net" + url)
        steam_icon = soup.select_one("i.lp-steam")
        steam_url = steam_icon.parent["href"]
        steam_id = steam_url.split("/profiles/")[1]
        return steam_id

    @classmethod
    def run(cls, output=None):
        res = []
        for team in cls._get_top_teams():
            team_data = {"name": team, "players": []}
            for player_name, country, url in cls._get_players(team):
                steam_id = cls._get_steam_id(url)
                team_data["players"].append({"name": player_name, "country": country, "steamId": steam_id})
            team_data["players"].sort(key=lambda p: p["name"].lower())
            res.append(team_data)

        res = json.dumps(res, indent=4)
        if not output:
            sys.stdout.write(res)
        else:
            with open(output, "w") as f:
                f.write(res)
        return res
