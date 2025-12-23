from django.core.management.base import BaseCommand
from content.models import Section, PageSection


class Command(BaseCommand):
    help = "Delete ALL content sections across HomePage and Pages (Section and PageSection)."

    def handle(self, *args, **options):
        hp_deleted, _ = Section.objects.all().delete()
        pg_deleted, _ = PageSection.objects.all().delete()
        self.stdout.write(self.style.SUCCESS(f"Deleted {hp_deleted} HomePage Section(s) and {pg_deleted} Page Section(s)."))