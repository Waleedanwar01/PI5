from django.core.management.base import BaseCommand
from content.models import (
    HomePage,
    Section,
    SiteConfig,
    Page,
    PageSection,
    Menu,
    MenuItem,
)


class Command(BaseCommand):
    help = "Delete ALL Django content: Pages, PageSections, HomePage, Sections, Menus, MenuItems, SiteConfig. Leaves auth users intact."

    def handle(self, *args, **options):
        # Delete children first to avoid FK constraints
        ps_deleted, _ = PageSection.objects.all().delete()
        s_deleted, _ = Section.objects.all().delete()
        mi_deleted, _ = MenuItem.objects.all().delete()

        p_deleted, _ = Page.objects.all().delete()
        hp_deleted, _ = HomePage.objects.all().delete()
        m_deleted, _ = Menu.objects.all().delete()
        sc_deleted, _ = SiteConfig.objects.all().delete()

        self.stdout.write(self.style.SUCCESS(
            (
                f"Deleted: PageSections={ps_deleted}, Sections={s_deleted}, "
                f"MenuItems={mi_deleted}, Pages={p_deleted}, HomePages={hp_deleted}, "
                f"Menus={m_deleted}, SiteConfigs={sc_deleted}"
            )
        ))