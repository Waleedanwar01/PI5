from django.db import migrations, models


def strip_videos_from_homepage(apps, schema_editor):
    HomePage = apps.get_model('content', 'HomePage')
    HomePageSection = apps.get_model('content', 'HomePageSection')
    import re

    # Remove iframes/videos/sources from HomePage.content
    for hp in HomePage.objects.all():
        html = hp.content or ''
        if isinstance(html, str) and html:
            html2 = re.sub(r"<iframe[\s\S]*?<\/iframe>", "", html, flags=re.IGNORECASE)
            html2 = re.sub(r"<video[\s\S]*?<\/video>", "", html2, flags=re.IGNORECASE)
            html2 = re.sub(r"<source[\s\S]*?>", "", html2, flags=re.IGNORECASE)
            if html2 != html:
                hp.content = html2
                hp.save(update_fields=['content'])

    # Convert any 'video' sections to non-video and clear video_url
    for s in HomePageSection.objects.all():
        stype = getattr(s, 'type', 'rich_text')
        if stype == 'video':
            s.type = 'rich_text'
            s.video_url = ''
            s.save(update_fields=['type', 'video_url'])

    # Remove any embed-type blocks from editor_blocks payloads
    def _strip_embeds(payload):
        try:
            if not payload:
                return payload
            # payload may be a dict with blocks or a list
            if isinstance(payload, dict):
                blocks = payload.get('blocks') or []
                filtered = [b for b in blocks if (getattr(b, 'get', lambda k, d=None: None)('type') or b.get('type') if isinstance(b, dict) else None) != 'embed']
                payload['blocks'] = filtered
                return payload
            if isinstance(payload, list):
                return [b for b in payload if (b.get('type') if isinstance(b, dict) else None) != 'embed']
        except Exception:
            return payload
        return payload

    for s in HomePageSection.objects.all():
        changed = False
        for fname in ('editor_blocks', 'col1_blocks', 'col2_blocks', 'col3_blocks', 'col4_blocks', 'col5_blocks'):
            val = getattr(s, fname, None)
            newval = _strip_embeds(val)
            if newval != val:
                setattr(s, fname, newval)
                changed = True
        if changed:
            s.save(update_fields=['editor_blocks', 'col1_blocks', 'col2_blocks', 'col3_blocks', 'col4_blocks', 'col5_blocks'])


class Migration(migrations.Migration):

    dependencies = [
        ('content', '0033_alter_homepage_content'),
    ]

    operations = [
        migrations.CreateModel(
            name='VideoPlacement',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('position', models.CharField(choices=[('top', 'Top of homepage'), ('bottom', 'Bottom of homepage')], default='top', max_length=20)),
                ('title', models.CharField(blank=True, default='', max_length=255)),
                ('video_url', models.URLField(blank=True, default='')),
                ('video_file', models.FileField(blank=True, null=True, upload_to='uploads/videos/')),
                ('published', models.BooleanField(default=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('homepage', models.ForeignKey(on_delete=models.deletion.CASCADE, related_name='video_placements', to='content.homepage')),
            ],
            options={
                'verbose_name': 'Video Placement',
                'verbose_name_plural': 'Video Placements',
                'ordering': ['-created_at'],
            },
        ),
        migrations.RunPython(strip_videos_from_homepage, migrations.RunPython.noop),
    ]