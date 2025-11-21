from django.db import migrations


def hide_editorial_guidelines(apps, schema_editor):
    Page = apps.get_model('content', 'Page')
    try:
        pg = Page.objects.filter(slug='editorial-guidelines').first()
    except Exception:
        pg = None
    if pg:
        # Hide from footer and optionally unpublish
        pg.show_in_footer = False
        pg.published = False
        pg.footer_order = 0
        pg.save(update_fields=['show_in_footer', 'published', 'footer_order'])


def unhide_editorial_guidelines(apps, schema_editor):
    Page = apps.get_model('content', 'Page')
    try:
        pg = Page.objects.filter(slug='editorial-guidelines').first()
    except Exception:
        pg = None
    if pg:
        # Restore original defaults: show in footer true and published true
        pg.show_in_footer = True
        pg.published = True
        pg.save(update_fields=['show_in_footer', 'published'])


class Migration(migrations.Migration):

    dependencies = [
        ('content', '0043_seed_homepage_and_footer_pages'),
    ]

    operations = [
        migrations.RunPython(hide_editorial_guidelines, reverse_code=unhide_editorial_guidelines),
    ]