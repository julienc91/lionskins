import time

import structlog
from django.core.management.base import BaseCommand

logger = structlog.get_logger(__name__)


class Command(BaseCommand):
    def handle(self, *args, **options):
        logger.info("Starting demo")
        time.sleep(10)
        logger.info("Finished demo")
