import json
import os
import re
from typing import Any, Optional

import requests
import structlog
from bs4 import BeautifulSoup
from django.core.management.base import BaseCommand
from ratelimit import limits, sleep_and_retry

from lionskins.utils.data import get_data_directory

logger = structlog.get_logger("fetch_players")


class Command(BaseCommand):
    @classmethod
    def output_file(cls) -> str:
        return os.path.join(get_data_directory(), "teams.json")

    @classmethod
    def _get_soup(
        cls, url: str, params: Optional[dict[str, Any]] = None
    ) -> BeautifulSoup:
        html = cls._get_content(url, params=params)
        return BeautifulSoup(html, features="html.parser")

    @classmethod
    @sleep_and_retry
    @limits(calls=1, period=5)
    def _get_content(
        cls, url: str, params: Optional[dict[str, Any]] = None
    ) -> Optional[bytes]:
        res = requests.get(url, params=params, headers={"User-Agent": "LionSkins/1.0"})
        if res.status_code != 200:
            return None
        return res.content

    @classmethod
    def _get_top_teams(cls):
        res = cls._get_content(
            "https://raw.githubusercontent.com/julienc91/hltv-ranking/rankings/latest.json"
        )
        api_data = json.loads(res)
        ranking = api_data["teams"]
        for team in ranking:
            yield team["name"]

    @classmethod
    def _get_team_players(cls, team: str) -> Optional[dict[str, Any]]:
        team = {  # Convert team name to liquipedia convention
            "1win": "1win",
            "9z": "9z Team",
            "hard legion": "Hard Legion Esports",
            "imperial": "Imperial Esports",
            "nemiga": "Nemiga Gaming",
            "nip": "Ninjas in Pyjamas",
            "outsiders": "Virtus.pro",
            "players": "Gambit_Esports",
            "saw": "SAw (Portuguese team)",
            "sinners": "Sinners Esports",
            "spirit": "Team Spirit",
            "teamone": "Team One",
        }.get(team.lower(), team)

        res = cls._get_content(  # Fetch the team's page on liquipedia
            "https://liquipedia.net/counterstrike/api.php?",
            {
                "action": "query",
                "titles": team,
                "prop": "revisions",
                "rvprop": "content",
                "format": "json",
                "redirects": True,
                "rvslots": "main",
            },
        )

        res = json.loads(res)
        pages = res["query"]["pages"]
        if pages.get("-1"):
            logger.error("Team not found on Liquipedia", team=team)
            return None

        page = list(pages.values())[0]
        content = page["revisions"][0]["slots"]["main"]["*"]

        try:
            active_squad = re.search(
                r"{{ActiveSquad\|(\n{{SquadPlayer.*}}\s*)+\n}}", content
            )[0].split("\n")[1:-1]
        except Exception as e:
            logger.exception(e)
            return None

        # Retrieve player names and countries from team page
        players = {}
        for player in active_squad:
            if re.search(r"\|\s*[^|]*\bcoach\b\s*\|", player, re.IGNORECASE):
                continue

            country = re.search(r"flag=(\w+)", player).groups()[0]
            player_name = re.search(r"player=([^|]+)\|", player).groups()[0]
            try:
                page_name = re.search(r"link=([^|]+)\|", player).groups()[0]
            except AttributeError:
                page_name = player_name

            players[page_name] = {"name": player_name, "country": country}
        return players

    @classmethod
    def _get_players_info(cls, team: str):
        players = cls._get_team_players(team)
        page_names = players.keys()
        res = cls._get_content(
            "https://liquipedia.net/counterstrike/api.php",
            {
                "action": "query",
                "titles": "|".join(page_names),
                "prop": "revisions",
                "rvprop": "content",
                "format": "json",
                "rvslots": "main",
            },
        )
        res = res.decode()
        res = json.loads(res)["query"]

        redirects = {
            redirect["to"]: redirect["from"] for redirect in res.get("normalized", [])
        }
        pages = res["pages"]

        for page_id, page in pages.items():
            if page_id == "-1":
                continue

            page_name = page["title"]
            page_name = redirects.get(page_name, page_name)

            content = page["revisions"][0]["slots"]["main"]["*"]

            for key, regex, post_process in [
                ("steamId", r"\|\s*steam=(\d+)\s*\|", None),
                ("role", r"\|\s*role=(\w+)\s*\|", str.lower),
            ]:
                value = re.search(regex, content) or None
                if value:
                    value = value.groups()[0]
                    if post_process:
                        value = post_process(value)
                players[page_name][key] = value

        return list(players.values())

    def handle(self, *args, **options):
        res = []
        for team in self._get_top_teams():
            team_data = {"name": team, "players": []}
            try:
                for player_info in self._get_players_info(team):
                    team_data["players"].append(player_info)
            except Exception as e:
                logger.exception(f"Error while retrieving team data: {e}", team=team)

            if team_data["players"]:
                team_data["players"].sort(key=lambda p: p["name"].lower())
                res.append(team_data)

        res = json.dumps(res, indent=4)
        with open(self.output_file(), "w") as f:
            f.write(res)
        return res
