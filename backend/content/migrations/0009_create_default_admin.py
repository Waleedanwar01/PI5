from django.db import migrations


def create_default_admin(apps, schema_editor):
    User = apps.get_model('auth', 'User')
    if not User.objects.filter(is_superuser=True).exists():
        User.objects.create_superuser(
            username='admin',
            email='admin@example.com',
            password='admin123',
        )


def remove_default_admin(apps, schema_editor):
    User = apps.get_model('auth', 'User')
    User.objects.filter(username='admin', is_superuser=True).delete()


class Migration(migrations.Migration):
    dependencies = [
        ('content', '0008_pagesection_col1_rich_pagesection_col2_rich_and_more'),
        ('auth', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(create_default_admin, remove_default_admin),
    ]