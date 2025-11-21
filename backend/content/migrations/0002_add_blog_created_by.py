from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('content', '0001_initial'),
        ('auth', '0012_alter_user_first_name_max_length'),
    ]

    operations = [
        migrations.AddField(
            model_name='blog',
            name='created_by',
            field=models.ForeignKey(
                related_name='created_blogs',
                on_delete=django.db.models.deletion.SET_NULL,
                to='auth.user',
                null=True,
                blank=True,
            ),
        ),
    ]