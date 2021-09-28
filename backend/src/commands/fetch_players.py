# -*- coding: utf-8 -*-

import json
import logging
import os
import re
from typing import Any, Optional

import requests
from bs4 import BeautifulSoup
from ratelimit import limits, sleep_and_retry

from utils.data import get_data_directory


class FetchPlayers:
    @classmethod
    def output_file(cls) -> str:
        return os.path.join(get_data_directory(), "teams.json")

    @classmethod
    def _get_soup(cls, url: str, params: Optional[dict[str, Any]] = None) -> BeautifulSoup:
        html = cls._get_content(url, params=params)
        return BeautifulSoup(html, features="html.parser")

    @classmethod
    @sleep_and_retry
    @limits(calls=1, period=5)
    def _get_content(cls, url: str, params: Optional[dict[str, Any]] = None) -> Optional[bytes]:
        res = requests.get(url, params=params, headers={"User-Agent": "LionSkins/1.0"})
        if res.status_code != 200:
            return None
        return res.content

    @classmethod
    def _get_top_teams(cls):
        # hltv.org blocks our server's ip address...
        # soup = cls._get_soup("https://www.hltv.org/ranking/teams/")
        # for div in soup.select(".ranking .ranked-team"):
        #     yield div.select_one(".ranking-header .name").text

        # globaranks.gg is no longer active
        # soup = cls._get_soup("https://globalranks.gg/")
        # for div in soup.select(".hltv .ranking"):
        #     team = div.select_one(".team").select_one("b").text
        #     yield {"navi": "  Natus Vincere", "nip": "Ninjas in Pyjamas"}.get(team.lower(), team)

        res = cls._get_content("https://egamersworld.com/counterstrike/team/ranking/hltv")
        api_data = re.search(r"var api_data = (.*)</script>", res.decode()).group(1)
        api_data = json.loads(api_data)
        ranking = api_data["content"]["list"]
        teams = {
            "complexity gaming": "Complexity",
            "endpoint": "Endpoint",
            "faze clan": "FaZe",
            "g2 esports": "G2",
            "gambit esports": "Gambit",
            "navi": "Natus Vincere",
            "nip": "Ninjas in Pyjamas",
        }
        for team in ranking:
            yield teams.get(team["name"].lower(), team["name"])

    @classmethod
    def _get_players(cls, team: str):
        team = {
            "1win": "1win",
            "hard legion": "Hard Legion Esports",
            "nemiga": "Nemiga Gaming",
            "saw": "SAw (Portuguese team)",
            "sinners": "Sinners Esports",
            "teamone": "Team One",
        }.get(team.lower(), team)

        res = cls._get_content(
            "https://liquipedia.net/counterstrike/api.php?",
            {"action": "query", "titles": team, "prop": "revisions", "rvprop": "content", "format": "json", "redirects": True},
        )

        res = json.loads(res)
        pages = res["query"]["pages"]
        if pages.get("-1"):
            logging.error(f"Team not found on Liquipedia: {team}")
            return

        page = list(pages.values())[0]
        content = page["revisions"][0]["*"]

        try:
            active_squad = re.search(r"{{ActiveSquad\|(\n{{SquadPlayer.*}}\s*)+\n}}", content)[0].split("\n")[1:-1]
        except Exception as e:
            logging.exception(e)
            return

        for player in active_squad:
            if re.search(r"\|\s*coach\s*\|", player, re.IGNORECASE):
                continue

            country = re.search(r"flag=(\w+)", player).groups()[0]
            player_name = re.search(r"player=([^|]+)\|", player).groups()[0]
            try:
                page_name = re.search(r"link=([^|]+)\|", player).groups()[0]
            except AttributeError:
                page_name = player_name

            yield player_name, country, page_name

    @classmethod
    def _get_steam_id(cls, page_title: str) -> Optional[str]:
        res = cls._get_content(
            "https://liquipedia.net/counterstrike/api.php",
            {"action": "query", "titles": page_title, "prop": "revisions", "rvprop": "content", "format": "json"},
        )
        res = res.decode()
        steam_id = re.search(r"steam=(\d+)", res)
        if not steam_id:
            return None
        return steam_id.groups()[0]

    @classmethod
    def run(cls):
        res = []
        for team in cls._get_top_teams():
            team_data = {"name": team, "players": []}
            for player_name, country, page_title in cls._get_players(team):
                steam_id = cls._get_steam_id(page_title)
                team_data["players"].append({"name": player_name, "country": country, "steamId": steam_id})
            if team_data["players"]:
                team_data["players"].sort(key=lambda p: p["name"].lower())
                res.append(team_data)

        res = json.dumps(res, indent=4)
        with open(cls.output_file(), "w") as f:
            f.write(res)
        return res
