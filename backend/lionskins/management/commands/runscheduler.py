import structlog
from apscheduler.schedulers.blocking import BlockingScheduler
from apscheduler.triggers.cron import CronTrigger
from apscheduler.triggers.interval import IntervalTrigger
from django.core.management import call_command
from django.core.management.base import BaseCommand
from django_apscheduler import util
from django_apscheduler.jobstores import DjangoJobStore
from django_apscheduler.models import DjangoJobExecution

from lionskins.models.enums import Providers

logger = structlog.getLogger(__name__)


@util.close_old_connections
def delete_old_job_executions(max_age=604_800):
    DjangoJobExecution.objects.delete_old_job_executions(max_age)


@util.close_old_connections
def django_command_wrapper(command_name, **kwargs):
    return call_command(command_name, **kwargs)


def generate_sitemap():
    return django_command_wrapper("generate_sitemap")


def fetch_players():
    return django_command_wrapper("fetch_players")


def fetch_provider(provider):
    return django_command_wrapper("fetch_providers", provider=provider)


class Command(BaseCommand):
    help = "Runs APScheduler."

    @staticmethod
    def add_job(scheduler, trigger, command, job_id=None, **kwargs):
        job_id = job_id or command.__name__
        scheduler.add_job(
            command,
            kwargs=kwargs,
            trigger=trigger,
            id=job_id,
            max_instances=1,
            replace_existing=True,
        )

    def handle(self, *args, **options):
        scheduler = BlockingScheduler()
        scheduler.add_jobstore(DjangoJobStore(), "default")

        self.add_job(scheduler, CronTrigger(minute="00", hour="*/12"), generate_sitemap)
        self.add_job(scheduler, CronTrigger(minute="00", hour="20"), fetch_players)

        for provider in Providers.active():
            self.add_job(
                scheduler, IntervalTrigger(hours=1), fetch_provider, job_id=f"fetch_provider_{provider}", provider=provider
            )

        self.add_job(scheduler, CronTrigger(minute="00", hour="00"), delete_old_job_executions)

        try:
            logger.info("Starting scheduler...")
            scheduler.start()
        except KeyboardInterrupt:
            logger.info("Stopping scheduler...")
            scheduler.shutdown()
            logger.info("Scheduler shut down successfully!")
