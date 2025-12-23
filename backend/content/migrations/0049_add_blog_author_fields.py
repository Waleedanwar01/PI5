from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('content', '0048_merge_created_by_and_0047'),
    ]

    operations = [
        migrations.AddField(
            model_name='blog',
            name='author_name',
            field=models.CharField(max_length=120, null=True, blank=True),
        ),
        migrations.AddField(
            model_name='blog',
            name='author_image',
            field=models.ImageField(upload_to='blog/authors/', null=True, blank=True),
        ),
    ]