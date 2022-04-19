import structlog
from django.core.management.base import BaseCommand
from django.utils import timezone

from csgo.models import Price
from csgo.providers import client_by_provider
from csgo.providers.abstract_client import UnfinishedJob
from csgo.providers.parser import Parser

logger = structlog.get_logger()


class Command(BaseCommand):
    def add_arguments(self, parser):
        parser.add_argument("--provider", type=str, required=True, help="provider to fetch")

    def handle(self, *args, **options):
        provider = options["provider"]
        client = client_by_provider[provider]()

        logger.info("Fetching data for provider", provider=provider)

        now = timezone.now()
        prices_updated, prices_deleted = 0, 0
        try:
            for item_name, price, kwargs in client.get_prices():
                skin = Parser.get_or_create_skin_from_item_name(item_name)
                if not skin:
                    continue

                update_fields = []
                kwargs = kwargs or {}
                for field, value in kwargs.items():
                    if getattr(skin, field) != value:
                        setattr(skin, field, value)
                        update_fields.append(field)

                if update_fields:
                    skin.save(update_fields)

                Price.objects.update_or_create(
                    skin=skin,
                    provider=provider,
                    defaults={"price": price, "update_date": now},
                )
                prices_updated += 1

        except UnfinishedJob:
            logger.warning("Fetching interrupted", provider=provider)
        else:
            prices_deleted, _ = Price.objects.filter(provider=provider, update_date__lt=now).delete()

        logger.info("Fetching finished", provider=provider, nb_updated=prices_updated, nb_deleted=prices_deleted)
