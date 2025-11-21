from django.core.management.base import BaseCommand
from content.models import Blog


class Command(BaseCommand):
    help = "Delete all Blog entries from the database. Use with caution."

    def handle(self, *args, **options):
        count = Blog.objects.count()
        Blog.objects.all().delete()
        self.stdout.write(self.style.SUCCESS(f"Deleted {count} Blog entries."))