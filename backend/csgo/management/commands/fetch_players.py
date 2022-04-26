import json
import re
from typing import Any, Iterator

import requests
import structlog
from bs4 import BeautifulSoup
from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone
from ratelimit import limits, sleep_and_retry
from slugify import slugify

from users.models import ProPlayer, ProTeam, User

logger = structlog.get_logger("fetch_players")


class Command(BaseCommand):
    @classmethod
    def _get_soup(cls, url: str, params: dict[str, Any] | None = None) -> BeautifulSoup:
        html = cls._get_content(url, params=params)
        return BeautifulSoup(html, features="html.parser")

    @classmethod
    @sleep_and_retry
    @limits(calls=1, period=5)
    def _get_content(
        cls, url: str, params: dict[str, Any] | None = None
    ) -> bytes | None:
        res = requests.get(url, params=params, headers={"User-Agent": "LionSkins/1.0"})
        if res.status_code != 200:
            return None
        return res.content

    @classmethod
    def get_top_teams(cls) -> Iterator[ProTeam]:
        res = cls._get_content(
            "https://raw.githubusercontent.com/julienc91/hltv-ranking/rankings/latest.json"
        )
        api_data = json.loads(res)
        ranking = api_data["teams"]
        for team_data in ranking:
            team_name = team_data["name"]
            team_slug = slugify(team_name)
            team, _ = ProTeam.objects.update_or_create(name=team_name, slug=team_slug)
            yield team

    @classmethod
    def _get_team_players_base_info_from_liquipedia(
        cls, team: ProTeam
    ) -> dict[str, Any]:
        page_name = team.liquipedia_id or team.name
        res = cls._get_content(  # Fetch the team's page on liquipedia
            "https://liquipedia.net/counterstrike/api.php?",
            {
                "action": "query",
                "titles": page_name,
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
            logger.error(
                "Team not found on Liquipedia", team_id=team.pk, team_name=team.name
            )
            return {}

        page = list(pages.values())[0]
        content = page["revisions"][0]["slots"]["main"]["*"]

        try:
            active_squad = re.search(
                r"{{ActiveSquad\|(\n{{SquadPlayer.*}}\s*)+\n}}", content
            )[0].split("\n")[1:-1]
        except Exception as e:
            logger.exception(
                "Unexpected liquipedia page parsing",
                team_id=team.pk,
                team_name=team.name,
                exc_info=e,
            )
            return {}

        players_info = {}
        for player in active_squad:
            if re.search(r"\|\s*[^|]*\bcoach\b\s*\|", player, re.IGNORECASE):
                continue

            country_code = re.search(r"flag=(\w+)", player).groups()[0]
            nickname = re.search(r"player=([^|]+)\|", player).groups()[0]
            try:
                page_name = re.search(r"link=([^|]+)\|", player).groups()[0]
            except AttributeError:
                page_name = nickname
            players_info[page_name] = {
                "nickname": nickname,
                "country_code": country_code,
            }

        page_title = page["title"]
        if page_title != team.liquipedia_id:
            team.liquipedia_id = page_title
            team.save(update_fields=["liquipedia_id"])

        return players_info

    @classmethod
    def get_team_players(cls, team: ProTeam) -> list[ProPlayer]:
        players_info = cls._get_team_players_base_info_from_liquipedia(team)
        if not players_info:
            return []

        page_names = players_info.keys()
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
            if int(page_id) < 0:
                continue

            page_name = page["title"]
            page_name = redirects.get(page_name, page_name)

            content = page["revisions"][0]["slots"]["main"]["*"]

            for key, regex, post_process in [
                ("name", r"\|\s*name\s*=\s*([^|]+)\s*\|", None),
                ("steam_id", r"\|\s*steam=(\d+)\s*\|", None),
                ("role", r"\|\s*role=(\w+)\s*\|", str.lower),
            ]:
                value = re.search(regex, content) or None
                if value:
                    value = value.groups()[0]
                    if post_process:
                        value = post_process(value)
                players_info[page_name][key] = value

        players = []
        for player_info in players_info.values():
            if not player_info.get("steam_id"):
                continue

            user, _ = User.objects.get_or_create(
                steam_id=player_info["steam_id"],
                defaults={"is_active": False, "username": player_info["nickname"]},
            )
            player, _ = ProPlayer.objects.update_or_create(
                user=user,
                defaults={
                    "nickname": player_info["nickname"],
                    "role": player_info.get("role", ""),
                    "slug": slugify(player_info["nickname"]),
                    "country_code": player_info["country_code"],
                },
            )
            players.append(player)
        return players

    def handle(self, *args, **options) -> None:
        teams = []
        now = timezone.now()

        for team in self.get_top_teams():
            players = self.get_team_players(team)

            with transaction.atomic():
                ProPlayer.objects.filter(team=team).update(team=None, update_date=now)
                ProPlayer.objects.filter(
                    pk__in=[player.pk for player in players]
                ).update(team=team, update_date=now)

            teams.append(team)

        with transaction.atomic():
            ProTeam.objects.update(rank=None, update_date=now)
            for i, team in enumerate(teams):
                team.rank = i + 1
                team.update_date = now
                team.save(update_fields=["rank", "update_date"])
