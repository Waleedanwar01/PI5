from django.db import migrations


def seed_homepage(apps, schema_editor):
    HomePage = apps.get_model('content', 'HomePage')
    HomePageSection = apps.get_model('content', 'HomePageSection')

    hp, created = HomePage.objects.get_or_create(
        id=1,
        defaults={
            'meta_title': 'Home',
            'meta_description': 'Find reliable auto insurance information and quotes.',
            'meta_keywords': 'auto insurance, quotes, coverage',
            'content': (
                '<p>Welcome to AutoInsurance.org — compare policies, understand coverage, and make informed decisions with transparent guides and tools.</p>'
            ),
            'home_cta_text': 'Get Quotes',
            'home_cta_url': '/quotes',
            'home_anchor_id': 'main-content',
        }
    )

    # Ensure reasonable defaults even if record already exists
    update = False
    if not (hp.meta_title or '').strip():
        hp.meta_title = 'Home'; update = True
    if not (hp.meta_description or '').strip():
        hp.meta_description = 'Find reliable auto insurance information and quotes.'; update = True
    if not (hp.home_anchor_id or '').strip():
        hp.home_anchor_id = 'main-content'; update = True
    if update:
        hp.save()

    # Create basic sections if not already present (by title)
    sections_to_create = [
        {
            'order': 1,
            'title': 'Why Choose Us',
            'subtitle': 'Transparent, accurate, and easy to compare.',
            'type': 'rich_text',
            'layout': 'full',
            'columns_count': 1,
            'collapsible': False,
            'body': '<p>We make shopping for auto insurance simpler. Compare policies, understand coverage, and save money.</p>',
        },
        {
            'order': 2,
            'title': 'Insurance Guides',
            'subtitle': 'Get up to speed quickly.',
            'type': 'rich_columns',
            'layout': 'grid3',
            'columns_count': 3,
            'collapsible': False,
            'body': '',
            'col1_title': 'Coverage Basics',
            'col1_subtitle': 'Liability vs. comprehensive',
            'col1_rich': '<p>Learn what each coverage means and why it matters.</p>',
            'col2_title': 'Rate Factors',
            'col2_subtitle': 'Credit, accidents, mileage',
            'col2_rich': '<p>Understand the key drivers that affect your premium.</p>',
            'col3_title': 'Savings Tips',
            'col3_subtitle': 'Bundling, safe driving',
            'col3_rich': '<p>Find ways to lower your costs without losing protection.</p>',
        },
    ]

    existing_titles = set(
        HomePageSection.objects.filter(homepage=hp).values_list('title', flat=True)
    )
    for sec in sections_to_create:
        if sec['title'] in existing_titles:
            continue
        HomePageSection.objects.create(homepage=hp, **sec)


def unseed_homepage(apps, schema_editor):
    HomePage = apps.get_model('content', 'HomePage')
    HomePageSection = apps.get_model('content', 'HomePageSection')
    try:
        hp = HomePage.objects.first()
    except Exception:
        hp = None
    if not hp:
        return
    HomePageSection.objects.filter(
        homepage=hp,
        title__in=['Why Choose Us', 'Insurance Guides']
    ).delete()


def seed_footer_pages(apps, schema_editor):
    Page = apps.get_model('content', 'Page')
    PageSection = apps.get_model('content', 'PageSection')

    pages = [
        # Company
        ('About Us', 'about-us', 'company', 10),
        ('Careers', 'careers', 'company', 11),
        ('Editorial Guidelines', 'editorial-guidelines', 'company', 12),
        ('Advertiser Disclosure', 'advertiser-disclosure', 'company', 13),
        ('Contact Us', 'contact', 'company', 14),
        # Legal
        ('Privacy Policy', 'privacy-policy', 'legal', 90),
        ('Terms & Conditions', 'terms', 'legal', 91),
        ('CCPA', 'ccpa', 'legal', 92),
    ]

    for title, slug, ptype, order in pages:
        page, created = Page.objects.get_or_create(
            slug=slug,
            defaults={
                'title': title,
                'page_type': ptype,
                'published': True,
                'meta_title': title,
                'meta_description': f'{title} page',
                'show_in_footer': True,
                'footer_order': order,
            }
        )

        if not created:
            changed = False
            if not (page.title or '').strip():
                page.title = title; changed = True
            if page.page_type != ptype:
                page.page_type = ptype; changed = True
            if not (page.meta_title or '').strip():
                page.meta_title = title; changed = True
            if not (page.meta_description or '').strip():
                page.meta_description = f'{title} page'; changed = True
            if not page.published:
                page.published = True; changed = True
            if not page.show_in_footer:
                page.show_in_footer = True; changed = True
            if not page.footer_order:
                page.footer_order = order; changed = True
            if changed:
                page.save()

        # Seed a simple rich text section if none exists
        if not page.sections.exists():
            PageSection.objects.create(
                page=page,
                order=1,
                title=title,
                subtitle='',
                type='rich_text',
                layout='full',
                body=f'<p>{title}</p>'
            )


def unseed_footer_pages(apps, schema_editor):
    Page = apps.get_model('content', 'Page')
    # Do not remove about-us (seeded in a prior migration)
    slugs = [
        'careers', 'editorial-guidelines', 'advertiser-disclosure', 'contact',
        'privacy-policy', 'terms', 'ccpa'
    ]
    Page.objects.filter(slug__in=slugs).delete()


class Migration(migrations.Migration):
    dependencies = [
        ('content', '0042_seed_about_us_page'),
    ]

    operations = [
        migrations.RunPython(seed_homepage, unseed_homepage),
        migrations.RunPython(seed_footer_pages, unseed_footer_pages),
    ]