from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = "Align Blog.parent_page with Blog.category.parent_page when missing or mismatched"

    def handle(self, *args, **options):
        from content.models import Blog

        fixed = 0
        for b in Blog.objects.select_related('parent_page', 'category').all():
            try:
                if b.category:
                    cat_pp = getattr(b.category, 'parent_page', None)
                    if cat_pp and (b.parent_page_id != cat_pp.id):
                        b.parent_page = cat_pp
                        b.save(update_fields=['parent_page'])
                        fixed += 1
            except Exception:
                continue

        self.stdout.write(self.style.SUCCESS(f"Fixed parent_page for {fixed} blogs."))