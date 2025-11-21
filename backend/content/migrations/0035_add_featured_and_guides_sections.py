from django.db import migrations


def create_sections(apps, schema_editor):
    HomePage = apps.get_model('content', 'HomePage')
    HomePageSection = apps.get_model('content', 'HomePageSection')

    home = HomePage.objects.first()
    if not home:
        home = HomePage.objects.create(meta_title='Home', meta_description='')

    # Featured In section using Editor blocks (compatible with frontend BlocksRenderer)
    featured = HomePageSection.objects.filter(homepage=home, title__iexact='Featured In').first()
    if not featured:
        featured = HomePageSection(
            homepage=home,
            title='Featured In',
            subtitle='',
            order=1,
            collapsible=True,
            type='editor',
            layout='full',
            columns_count=1,
        )
    featured.editor_blocks = {
        "blocks": [
            {"type": "header", "data": {"text": "Featured In", "level": 3}},
            # Logo images (external URLs for simplicity)
            {"type": "image", "data": {"url": "https://www.autoinsurance.org/images/Allstate-Logo-1-7.png", "caption": "Allstate"}},
            {"type": "image", "data": {"url": "https://www.autoinsurance.org/images/American-Family-Insurance-Logo-1-6.png", "caption": "American Family"}},
            {"type": "image", "data": {"url": "https://www.autoinsurance.org/images/Farmers-2.png", "caption": "Farmers"}},
            {"type": "image", "data": {"url": "https://www.autoinsurance.org/images/Geico-Logo-1-2.png", "caption": "Geico"}},
        ]
    }
    featured.save()

    # Insurance Guides section as Rich Text with simple links/content
    guides = HomePageSection.objects.filter(homepage=home, title__icontains='Insurance Guides').first()
    if not guides:
        guides = HomePageSection(
            homepage=home,
            title='Insurance Guides',
            subtitle='Get up to speed quickly.',
            order=2,
            collapsible=True,
            type='rich_text',
            layout='full',
            columns_count=1,
        )
    guides.body = (
        "<p>Explore our most helpful auto insurance guides:</p>"
        "<ul>"
        "<li><a href='/best-auto-insurance-for-sports-cars/'>Best Insurance for Sports Cars</a></li>"
        "<li><a href='/best-auto-insurance-for-trucks/'>Best Insurance for Trucks</a></li>"
        "<li><a href='/auto-insurance-laws/'>Auto Insurance Laws</a></li>"
        "</ul>"
    )
    guides.save()


def remove_sections(apps, schema_editor):
    HomePage = apps.get_model('content', 'HomePage')
    HomePageSection = apps.get_model('content', 'HomePageSection')
    home = HomePage.objects.first()
    if not home:
        return
    HomePageSection.objects.filter(homepage=home, title__iexact='Featured In').delete()
    HomePageSection.objects.filter(homepage=home, title__icontains='Insurance Guides').delete()


class Migration(migrations.Migration):
    dependencies = [
        ('content', '0034_videoplacement_and_strip_videos'),
    ]

    operations = [
        migrations.RunPython(create_sections, remove_sections),
    ]