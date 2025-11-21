from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('content', '0034_videoplacement_and_strip_videos'),
    ]

    operations = [
        migrations.AddField(
            model_name='videoplacement',
            name='target_page',
            field=models.ForeignKey(blank=True, null=True, on_delete=models.CASCADE, related_name='video_placements', to='content.mainpage'),
        ),
        migrations.AlterField(
            model_name='videoplacement',
            name='homepage',
            field=models.ForeignKey(blank=True, null=True, on_delete=models.CASCADE, related_name='video_placements', to='content.homepage'),
        ),
    ]