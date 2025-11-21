from django.db import migrations


def create_about_us(apps, schema_editor):
    Page = apps.get_model('content', 'Page')
    PageSection = apps.get_model('content', 'PageSection')

    slug = 'about-us'
    page, created = Page.objects.get_or_create(
        slug=slug,
        defaults={
            'title': 'About Us',
            'page_type': 'company',
            'published': True,
            'meta_title': 'About Us',
            'meta_description': 'Learn more about our company, mission, and team.',
            'show_in_footer': True,
            'footer_order': 10,
        }
    )

    # Ensure page has reasonable meta if it already existed
    if not created:
        update = False
        if not page.title:
            page.title = 'About Us'; update = True
        if not page.meta_title:
            page.meta_title = 'About Us'; update = True
        if not page.meta_description:
            page.meta_description = 'Learn more about our company, mission, and team.'; update = True
        if not page.published:
            page.published = True; update = True
        if update:
            page.save()

    # Create section 1: full-width rich text
    PageSection.objects.get_or_create(
        page=page,
        order=1,
        title='Who We Are',
        defaults={
            'subtitle': 'Our mission and values',
            'type': 'rich_text',
            'layout': 'full',
            'body': (
                '<h2>About Our Company</h2>'
                '<p>We are committed to delivering reliable insurance information and tools that help you make informed decisions.</p>'
                '<p>Our team combines industry expertise with user-first design to create a trustworthy experience.</p>'
            ),
        }
    )

    # Create section 2: two-column rich content
    PageSection.objects.get_or_create(
        page=page,
        order=2,
        title='What We Do',
        defaults={
            'subtitle': 'Services and approach',
            'type': 'rich_columns',
            'layout': 'grid2',
            'columns_count': 2,
            'col1_title': 'Our Services',
            'col1_rich': (
                '<ul>'
                '<li>Policy comparisons</li>'
                '<li>Coverage guides</li>'
                '<li>Rate insights</li>'
                '</ul>'
            ),
            'col2_title': 'Our Approach',
            'col2_rich': (
                '<p>We focus on transparency, accuracy, and usability.</p>'
                '<p>Content is vetted and layouts are optimized for all devices.</p>'
            ),
        }
    )


def remove_about_us_sections(apps, schema_editor):
    Page = apps.get_model('content', 'Page')
    PageSection = apps.get_model('content', 'PageSection')
    try:
        page = Page.objects.get(slug='about-us')
    except Page.DoesNotExist:
        return
    # Remove only the sections we created to avoid data loss
    PageSection.objects.filter(page=page, title__in=['Who We Are', 'What We Do']).delete()


class Migration(migrations.Migration):
    dependencies = [
        ('content', '0041_alter_page_options_page_footer_order_and_more'),
    ]

    operations = [
        migrations.RunPython(create_about_us, remove_about_us_sections),
    ]