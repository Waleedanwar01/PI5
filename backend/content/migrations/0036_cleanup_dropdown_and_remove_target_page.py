from django.db import migrations


def cleanup_dropdown_positions(apps, schema_editor):
    VideoPlacement = apps.get_model('content', 'VideoPlacement')
    HomePage = apps.get_model('content', 'HomePage')
    hp = HomePage.objects.first()
    try:
        for vp in VideoPlacement.objects.filter(position='dropdown'):
            vp.position = 'bottom'
            if getattr(vp, 'homepage_id', None) is None and hp:
                vp.homepage_id = hp.id
            vp.save(update_fields=['position', 'homepage'])
    except Exception:
        # Best-effort cleanup; ignore if table/state is unexpected
        pass


class Migration(migrations.Migration):

    dependencies = [
        ('content', '0035_video_dropdown_target_page'),
    ]

    operations = [
        migrations.RunPython(cleanup_dropdown_positions, migrations.RunPython.noop),
        migrations.RemoveField(
            model_name='videoplacement',
            name='target_page',
        ),
    ]