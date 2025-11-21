from django.db import migrations
import os


def apply_env_to_siteconfig(apps, schema_editor):
    SiteConfig = apps.get_model('content', 'SiteConfig')
    cfg = SiteConfig.objects.first()
    if not cfg:
        cfg = SiteConfig.objects.create()

    # Map environment variables to SiteConfig fields
    # Only set values if the env var is present; avoid hardcoding defaults
    env_map = {
        'SITE_BRAND_NAME': 'brand_name',
        'SITE_EMAIL': 'email',
        'SITE_PHONE_NUMBER': 'phone_number',
        'SITE_DISCLAIMER': 'disclaimer',
        'SITE_HERO_TITLE': 'hero_title',
        'SITE_TAGLINE': 'tagline',
        'SITE_COPYRIGHT_TEXT': 'copyright_text',
        'SITE_FOOTER_ABOUT_TEXT': 'footer_about_text',
        'SITE_COMPANY_ADDRESS': 'company_address',
        'SITE_LOGO_HEIGHT_PX': 'logo_height_px',
        'SITE_ACCENT_ORANGE_HEX': 'accent_orange_hex',
        'SITE_ACCENT_ORANGE_HOVER_HEX': 'accent_orange_hover_hex',
        'SITE_ACCENT_GRADIENT_FROM_HEX': 'accent_gradient_from_hex',
        'SITE_ACCENT_GRADIENT_TO_HEX': 'accent_gradient_to_hex',
        'SITE_BUTTONS_BORDER_WIDTH_PX': 'buttons_border_width_px',
        'SITE_BUTTONS_RADIUS_PX': 'buttons_radius_px',
        'SITE_BUTTONS_UPPERCASE': 'buttons_uppercase',
        'SITE_BUTTONS_FONT_WEIGHT': 'buttons_font_weight',
        'SITE_HEADINGS_FONT_WEIGHT': 'headings_font_weight',
        'SITE_LINKS_UNDERLINE': 'links_underline',
        'SITE_LINKS_FONT_WEIGHT': 'links_font_weight',
        'SITE_FACEBOOK_URL': 'facebook_url',
        'SITE_TWITTER_URL': 'twitter_url',
        'SITE_INSTAGRAM_URL': 'instagram_url',
        'SITE_YOUTUBE_URL': 'youtube_url',
        'SITE_LINKEDIN_URL': 'linkedin_url',
    }

    updated = False
    for env_key, field_name in env_map.items():
        if env_key in os.environ:
            raw = os.environ.get(env_key)
            # Convert types for integer and boolean fields
            if field_name.endswith('_px') or field_name.endswith('_width_px'):
                try:
                    value = int(raw)
                except Exception:
                    # Ignore invalid integers
                    continue
            elif field_name in ['buttons_uppercase', 'links_underline']:
                value = str(raw).strip().lower() in ['1', 'true', 'yes']
            else:
                value = raw
            setattr(cfg, field_name, value)
            updated = True

    if updated:
        cfg.save()


class Migration(migrations.Migration):
    dependencies = [
        ('content', '0058_siteconfig_buttons_border_width_px_and_more'),
    ]

    operations = [
        migrations.RunPython(apply_env_to_siteconfig, migrations.RunPython.noop),
    ]