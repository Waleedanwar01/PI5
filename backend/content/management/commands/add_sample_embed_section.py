from django.core.management.base import BaseCommand
from content.models import HomePage, HomePageSection
from django.db.models import Max


class Command(BaseCommand):
    help = "Create a sample Editor Blocks section with an iframe embed on the Homepage."

    def handle(self, *args, **options):
        # Ensure there is a HomePage singleton
        hp = HomePage.objects.first()
        if not hp:
            hp = HomePage.objects.create(
                meta_title="Home",
                meta_description="",
            )
            self.stdout.write(self.style.WARNING("No HomePage found; created a new one."))

        # Avoid duplicate sample sections
        existing = hp.sections.filter(title__iexact="Embedded Video").first()
        if existing:
            self.stdout.write(self.style.WARNING("Sample 'Embedded Video' section already exists. Updating its embed URL."))
            sec = existing
        else:
            # Place after any existing sections
            max_order = hp.sections.aggregate(Max('order')).get('order__max') or 0
            sec = HomePageSection(
                homepage=hp,
                title="Embedded Video",
                subtitle="Sample iframe via Editor Blocks",
                order=max_order + 1,
                collapsible=True,
                type='editor',
                layout='full',
                columns_count=1,
            )

        # EditorJS-like blocks payload with an embed/iframe
        # BlocksRenderer on frontend supports both array and {blocks: [...]} format.
        sec.editor_blocks = {
            "blocks": [
                {
                    "type": "embed",
                    "data": {
                        # YouTube embed sample; replace with your desired provider URL
                        "embed": "https://www.youtube.com/embed/dQw4w9WgXcQ",
                        "height": 360,
                    },
                }
            ]
        }

        sec.save()
        self.stdout.write(self.style.SUCCESS("Added/updated sample Editor Blocks section with an iframe embed."))