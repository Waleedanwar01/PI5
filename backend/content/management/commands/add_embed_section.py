from django.core.management.base import BaseCommand
from django.utils import timezone
from urllib.parse import urlparse, parse_qs

from content.models import HomePage, HomePageSection


def to_embed_url(url: str) -> str:
    """Convert common video URLs to embeddable iframe URLs."""
    if not url:
        return ''
    u = url.strip()
    # YouTube watch -> embed
    if 'youtube.com/watch' in u:
        parsed = urlparse(u)
        qs = parse_qs(parsed.query)
        vid = (qs.get('v') or [''])[0]
        if vid:
            return f"https://www.youtube.com/embed/{vid}"
    # youtu.be short links
    if 'youtu.be/' in u:
        try:
            vid = u.split('youtu.be/', 1)[1].split('?')[0]
            if vid:
                return f"https://www.youtube.com/embed/{vid}"
        except Exception:
            pass
    # Vimeo regular page to player
    if 'vimeo.com/' in u and 'player.vimeo.com' not in u:
        try:
            vid = u.rstrip('/').split('/')[-1]
            if vid.isdigit():
                return f"https://player.vimeo.com/video/{vid}"
        except Exception:
            pass
    # Otherwise assume already embeddable or provider-specific
    return u


class Command(BaseCommand):
    help = "Create or update a Homepage 'Editor Blocks' section with an iframe embed from a given URL."

    def add_arguments(self, parser):
        parser.add_argument('url', type=str, help='Video/page URL (YouTube/Vimeo/etc.). Will be converted to embed URL when possible.')
        parser.add_argument('--title', type=str, default='Video Embed', help='Section title')
        parser.add_argument('--order', type=int, default=50, help='Section order position')

    def handle(self, *args, **options):
        raw_url = options['url']
        embed_url = to_embed_url(raw_url)
        title = options['title']
        order = options['order']

        # Ensure homepage exists
        home, _ = HomePage.objects.get_or_create(id=1, defaults={
            'meta_title': 'Home',
            'meta_description': '',
        })

        # Find existing section by title/order or create a new one
        sec, created = HomePageSection.objects.get_or_create(
            homepage=home,
            title=title,
            order=order,
            defaults={
                'type': 'editor',
                'layout': 'full',
            }
        )

        sec.type = 'editor'
        sec.layout = 'full'
        sec.subtitle = 'Embedded via Editor Blocks'
        sec.editor_blocks = {
            'time': int(timezone.now().timestamp() * 1000),
            'blocks': [
                {
                    'type': 'header',
                    'data': { 'text': 'Featured Video', 'level': 3 }
                },
                {
                    'type': 'embed',
                    'data': {
                        'embed': embed_url,
                        'source': embed_url,
                        'url': embed_url,
                        'caption': 'Video',
                        'height': 360,
                    }
                }
            ]
        }
        sec.save()

        self.stdout.write(self.style.SUCCESS(
            f"Editor embed section set to {embed_url}. Title='{title}', order={order}."
        ))