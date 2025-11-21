from django.db import migrations


def create_siteconfig(apps, schema_editor):
    SiteConfig = apps.get_model('content', 'SiteConfig')
    # Ensure a single default record exists with sensible defaults
    if not SiteConfig.objects.exists():
        SiteConfig.objects.create(
            brand_name='AutoInsurance.org',
            email='',
            phone_number='(800) 308-0987',
            disclaimer='',
            hero_title='Auto insurance made clear.',
            tagline='Compare policies, understand coverage, and save money.',
            social_links_text='',
            social_links=None,
            facebook_url='',
            twitter_url='',
            instagram_url='',
            youtube_url='',
            linkedin_url='',
            footer_company_links=None,
            footer_legal_links=None,
            copyright_text='',
            footer_about_text='',
            logo_height_px=None,
            company_address='',
            accent_orange_hex='#c2410c',
            accent_orange_hover_hex='#9a3412',
            accent_gradient_from_hex='',
            accent_gradient_to_hex='',
        )
    else:
        # Normalize to ensure at least brand_name exists
        cfg = SiteConfig.objects.first()
        updated = False
        if not (cfg.brand_name or '').strip():
            cfg.brand_name = 'AutoInsurance.org'; updated = True
        if cfg.accent_orange_hex in (None, ''):
            cfg.accent_orange_hex = '#c2410c'; updated = True
        if cfg.accent_orange_hover_hex in (None, ''):
            cfg.accent_orange_hover_hex = '#9a3412'; updated = True
        if updated:
            cfg.save()


def remove_siteconfig(apps, schema_editor):
    SiteConfig = apps.get_model('content', 'SiteConfig')
    # Only remove if exactly one exists to avoid nuking user data
    try:
        if SiteConfig.objects.count() == 1:
            SiteConfig.objects.all().delete()
    except Exception:
        pass


class Migration(migrations.Migration):
    dependencies = [
        ('content', '0054_siteconfig_accent_gradient_from_hex_and_more'),
    ]

    operations = [
        migrations.RunPython(create_siteconfig, remove_siteconfig),
    ]