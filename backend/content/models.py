from django.db import models
from django.utils.text import slugify
import re
from ckeditor.fields import RichTextField
from ckeditor_uploader.fields import RichTextUploadingField
from django_ckeditor_5.fields import CKEditor5Field
from ckeditor.fields import RichTextField
from django.core.exceptions import ValidationError
from django_editorjs_fields.fields import EditorJsJSONField
from django.utils.text import slugify


class MainPage(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=120, unique=True)
    order = models.PositiveIntegerField(default=0)
    show_in_header = models.BooleanField(default=True)
    has_dropdown = models.BooleanField(default=True)

    class Meta:
        ordering = ["order", "name"]

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)




class Category(models.Model):
    name = models.CharField(max_length=120)
    slug = models.SlugField(max_length=140)
    parent_page = models.ForeignKey(MainPage, on_delete=models.CASCADE, related_name="categories")

    # Inline blog fields (manage blog content directly on the Category)
    blog_published = models.BooleanField(default=False)
    blog_title = models.CharField(max_length=200, blank=True, null=True)
    blog_summary = models.TextField(blank=True, null=True)
    blog_content = RichTextUploadingField('Blog Content', blank=True, null=True)
    
    # Author fields for blog articles
    blog_author_name = models.CharField(max_length=120, blank=True, null=True, help_text="Author name for this article")
    blog_author_image = models.ImageField(upload_to="blog/authors/", blank=True, null=True, help_text="Author image for this article")
    blog_author_description = models.TextField(blank=True, null=True, help_text="Short description about the author")

    # Reviewer fields for blog articles
    blog_reviewer_name = models.CharField(max_length=120, blank=True, null=True, help_text="Reviewer name for this article")
    blog_reviewer_image = models.ImageField(upload_to="blog/reviewers/", blank=True, null=True, help_text="Reviewer image for this article")
    blog_reviewer_description = models.TextField(blank=True, null=True, help_text="Short description about the reviewer")

    class Meta:
        unique_together = ("parent_page", "slug")
        ordering = ["name"]

    def __str__(self):
        return f"{self.name} — {self.parent_page.name}"

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)


class Blog(models.Model):
    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=220, unique=True)
    summary = models.TextField(blank=True, null=True)
    content = RichTextUploadingField('Content', blank=True, null=True)
    hero_image = models.ImageField(upload_to="blog/", blank=True, null=True)
    # Address field for footer address
    footer_address = models.TextField(blank=True, default='', help_text="Address to be displayed in footer for this article")

    # Track which admin user created the blog
    created_by = models.ForeignKey('auth.User', on_delete=models.SET_NULL, null=True, blank=True, related_name='created_blogs')

    # Author presentation fields (editable text and image in admin)
    author_name = models.CharField(max_length=120, blank=True, null=True)
    author_image = models.ImageField(upload_to="blog/authors/", blank=True, null=True)
    author_description = models.TextField(blank=True, null=True, help_text="Short description about the author")

    parent_page = models.ForeignKey(MainPage, on_delete=models.SET_NULL, null=True, blank=True, related_name="blogs")
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True, related_name="blogs")

    # Reviewer fields for blog articles
    reviewer_name = models.CharField(max_length=120, blank=True, null=True)
    reviewer_image = models.ImageField(upload_to="blog/reviewers/", blank=True, null=True)
    reviewer_description = models.TextField(blank=True, null=True)

    published = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        """Ensure parent_page aligns with category and generate a stable slug.

        - If a category is selected and parent_page is missing, set parent_page
          to category.parent_page to prevent cross-page leakage.
        - Generate slug preferring the category slug; otherwise use a slugified
          title. Enforce uniqueness by adding a numeric suffix when required.
        """
        # Auto-align parent_page
        try:
            if self.category and not self.parent_page:
                self.parent_page = self.category.parent_page
        except Exception:
            pass

        # Slug generation based on category or title
        try:
            base = self.category.slug if (self.category and self.category.slug) else slugify(self.title or '')
        except Exception:
            base = slugify(self.title or '')

        candidate = base or (self.slug or '') or slugify(self.title or '')
        from django.db.models import Q
        if candidate:
            i = 0
            unique = candidate
            while Blog.objects.filter(Q(slug=unique) & ~Q(pk=self.pk)).exists():
                i += 1
                unique = f"{candidate}-{i}"
            self.slug = unique
        else:
            self.slug = slugify(self.title or '')

        super().save(*args, **kwargs)

    def clean(self):
        # Must belong to at least one of: parent_page or category
        # Allow both when they match (category.parent_page == parent_page)
        from django.core.exceptions import ValidationError
        if not self.parent_page and not self.category:
            raise ValidationError("Select either a Page or a Category for the blog (at least one).")
        if self.parent_page and self.category:
            try:
                if self.category.parent_page_id != self.parent_page_id:
                    raise ValidationError("Selected Category belongs to a different Page. Choose a matching Page or leave Page blank.")
            except Exception:
                raise ValidationError("Invalid Category/Page selection.")

    # Note: single save() above handles parent_page alignment and slug generation.

# All prior content models (HomePage, Section, SiteConfig, Page, PageSection,
# Menu, MenuItem) have been removed to reset the schema.
# Define new models here when ready.


class SiteConfig(models.Model):
    brand_name = models.CharField(max_length=255, blank=True, default='AutoInsurance.org')
    email = models.EmailField(blank=True, default='')
    phone_number = models.CharField(max_length=30, blank=True, default='(800) 308-0987')
    disclaimer = models.TextField(blank=True, default='')
    hero_title = models.CharField(max_length=255, blank=True, default='', help_text='Main homepage heading, e.g., "Auto insurance made clear."')
    tagline = models.CharField(
        'Tagline Description',
        max_length=255,
        blank=True,
        default='',
        help_text='Homepage tagline description shown under the hero title'
    )
    # Media uploads (use FileField to support SVG and other formats)
    logo = models.FileField(upload_to='site/', blank=True, null=True)
    logo_icon = models.FileField(upload_to='site/', blank=True, null=True)
    favicon = models.FileField(upload_to='site/', blank=True, null=True)
    # Social links: either newline-separated URLs in social_links_text or legacy JSON in social_links
    social_links_text = models.TextField(blank=True, default='', help_text='Deprecated: Enter one social URL per line')
    social_links = models.JSONField(blank=True, null=True, help_text='Legacy format: [{"name":"Twitter","href":"https://twitter.com/..."}, ...]')
    # Per-platform URLs (preferred)
    facebook_url = models.URLField(blank=True, default='')
    twitter_url = models.URLField(blank=True, default='')
    instagram_url = models.URLField(blank=True, default='')
    youtube_url = models.URLField(blank=True, default='')
    linkedin_url = models.URLField(blank=True, default='')
    # Theme controls (admin-managed UI behavior)
    buttons_border_width_px = models.PositiveIntegerField(blank=True, null=True, default=1, help_text='Default button border width in pixels (e.g., 1)')
    buttons_radius_px = models.PositiveIntegerField(blank=True, null=True, default=8, help_text='Default button corner radius in pixels (e.g., 8)')
    buttons_uppercase = models.BooleanField(default=False, help_text='Make button text uppercase globally')
    buttons_font_weight = models.CharField(max_length=20, blank=True, default='', help_text='Button font-weight (e.g., 500, 600, bold)')
    headings_font_weight = models.CharField(max_length=20, blank=True, default='', help_text='Headings font-weight (e.g., 700, 800, bold)')
    links_underline = models.BooleanField(default=False, help_text='Underline links globally')
    links_font_weight = models.CharField(max_length=20, blank=True, default='', help_text='Link font-weight (e.g., 500, 600)')
    # Deprecated footer links (hidden in admin)
    footer_company_links = models.JSONField(blank=True, null=True, help_text='Deprecated')
    footer_legal_links = models.JSONField(blank=True, null=True, help_text='Deprecated')
    # Footer and logo controls
    copyright_text = models.CharField(max_length=255, blank=True, default='', help_text='e.g., "Copyright © 2025 YourBrand"; leave blank to auto-generate')
    footer_about_text = models.TextField(blank=True, default='', help_text='Top footer description text shown under brand name')
    logo_height_px = models.PositiveIntegerField(blank=True, null=True, help_text='Logo height in pixels; leave empty to use default')
    company_address = models.TextField(blank=True, default='', help_text='Company address shown in footer')
    # Accent color (Orange): admin-configurable hex for primary orange shade
    accent_orange_hex = models.CharField(
        max_length=7,
        blank=True,
        default='#c2410c',
        help_text='Primary orange accent color (hex, e.g., #c2410c). Only this orange will change.'
    )
    accent_orange_hover_hex = models.CharField(
        max_length=7,
        blank=True,
        default='#9a3412',
        help_text='Hover orange accent color (hex, e.g., #9a3412).'
    )
    # Admin-configurable gradient endpoints (hex). If left blank, frontend will
    # fall back to accent_orange_hex and accent_orange_hover_hex respectively.
    accent_gradient_from_hex = models.CharField(
        max_length=7,
        blank=True,
        default='',
        help_text='Gradient start color (hex, e.g., #ea580c). Leave blank to use Accent Orange.'
    )
    accent_gradient_to_hex = models.CharField(
        max_length=7,
        blank=True,
        default='',
        help_text='Gradient end color (hex, e.g., #c2410c). Leave blank to use Accent Hover.'
    )
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Site Configuration'
        verbose_name_plural = 'Site Configuration'

    def __str__(self):
        return f"SiteConfig: {self.brand_name}"

    def clean(self):
        # Enforce singleton: only one record allowed
        if SiteConfig.objects.exclude(pk=self.pk).exists():
            raise ValidationError('Only one SiteConfig is allowed. Edit or delete the existing one.')

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)


class HomePage(models.Model):
    meta_title = models.CharField(max_length=255, blank=True, default='')
    meta_description = models.TextField(blank=True, default='')
    meta_keywords = models.TextField(blank=True, default='', help_text='Comma-separated keywords')
    hero_image = models.ImageField(upload_to='homepage/', blank=True, null=True)
    # CKEditor v4 with upload support (images + non-image files like videos)
    content = RichTextUploadingField('Content', blank=True, null=True)
    # Homepage button and anchor options for main content
    home_cta_text = models.CharField(max_length=100, blank=True, default='', help_text='Homepage button label (e.g., "Start Now")')
    home_cta_url = models.CharField(max_length=255, blank=True, default='', help_text='Homepage button link URL (e.g., https://example.com or /quotes)')
    home_anchor_id = models.SlugField(max_length=255, blank=True, default='', help_text='Optional anchor ID for homepage content section')
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Homepage'
        verbose_name_plural = 'Homepage'

    def __str__(self):
        return self.meta_title or 'Homepage'

    def clean(self):
        # Enforce singleton HomePage
        if HomePage.objects.exclude(pk=self.pk).exists():
            raise ValidationError('Only one HomePage is allowed. Edit the existing one.')
        
        # Handle URL validation for empty or None values
        if hasattr(self, 'home_cta_url') and not self.home_cta_url:
            self.home_cta_url = ''

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)


class HomePageSection(models.Model):
    homepage = models.ForeignKey(HomePage, on_delete=models.CASCADE, related_name='sections')
    title = models.CharField(max_length=255)
    subtitle = models.CharField(max_length=255, blank=True, default='')
    anchor_id = models.SlugField(max_length=255, blank=True, default='')
    order = models.PositiveIntegerField(default=0)
    collapsible = models.BooleanField(default=True)
    # Visual styles
    background_color = models.CharField(max_length=20, blank=True, default='')
    text_color = models.CharField(max_length=20, blank=True, default='')

    # Section type and layout
    type = models.CharField(
        max_length=20,
        choices=[
            ('rich_text', 'Rich Text'),
            ('rich_columns', 'Rich Columns'),
            ('media', 'Media'),
            ('video', 'Video'),
            ('graph', 'Graph'),
            ('code', 'Code'),
            ('gallery', 'Gallery'),
            ('stats', 'Stats'),
            ('editor', 'Editor Blocks'),
            ('cta', 'CTA')
        ],
        default='rich_text'
    )
    layout = models.CharField(
        max_length=20,
        choices=[
            ('full', 'Full Width'),
            ('split', 'Two Columns'),
            ('grid2', 'Grid (2 Columns)'),
            ('grid3', 'Grid (3 Columns)'),
            ('grid4', 'Grid (4 Columns)'),
            ('grid5', 'Grid (5 Columns)')
        ],
        default='full'
    )
    columns_count = models.PositiveIntegerField(default=1, help_text='1 for full width; 2/3/4 for columns')

    # Common rich/body content
    body = CKEditor5Field('Body', config_name='default', blank=True, null=True)

    # Column titles/subtitles (for rich_columns)
    col1_title = models.CharField(max_length=255, blank=True, default='')
    col1_subtitle = models.CharField(max_length=255, blank=True, default='')
    col2_title = models.CharField(max_length=255, blank=True, default='')
    col2_subtitle = models.CharField(max_length=255, blank=True, default='')
    col3_title = models.CharField(max_length=255, blank=True, default='')
    col3_subtitle = models.CharField(max_length=255, blank=True, default='')
    col4_title = models.CharField(max_length=255, blank=True, default='')
    col4_subtitle = models.CharField(max_length=255, blank=True, default='')
    col5_title = models.CharField(max_length=255, blank=True, default='')
    col5_subtitle = models.CharField(max_length=255, blank=True, default='')

    # Columns (for rich_columns)
    col1_rich = CKEditor5Field('Column 1', config_name='default', blank=True, null=True)
    col2_rich = CKEditor5Field('Column 2', config_name='default', blank=True, null=True)
    col3_rich = CKEditor5Field('Column 3', config_name='default', blank=True, null=True)
    col4_rich = CKEditor5Field('Column 4', config_name='default', blank=True, null=True)
    col5_rich = CKEditor5Field('Column 5', config_name='default', blank=True, null=True)

    # Media section fields
    image = models.ImageField(upload_to='homepage/sections/', blank=True, null=True)

    # Video section fields
    video_url = models.URLField(blank=True, default='')

    # Graph section fields
    chart_config = models.JSONField(blank=True, null=True, help_text='{"data": [{"label": "A", "value": 10}, ...]}')

    # Code section fields
    code = models.TextField(blank=True, default='')

    # Gallery section fields
    media_gallery = models.JSONField(blank=True, null=True, help_text='["/media/path1.jpg", "/media/path2.jpg", ...]')

    # Stats section fields
    stats = models.JSONField(blank=True, null=True, help_text='[{"label": "Customers", "value": "1000"}, ...]')

    # CTA section fields
    cta_text = models.CharField(max_length=100, blank=True, default='')
    cta_url = models.URLField(blank=True, default='')

    # EditorJS blocks (single column or per-column)
    editor_blocks = EditorJsJSONField(blank=True, null=True)
    col1_blocks = EditorJsJSONField(blank=True, null=True)
    col2_blocks = EditorJsJSONField(blank=True, null=True)
    col3_blocks = EditorJsJSONField(blank=True, null=True)
    col4_blocks = EditorJsJSONField(blank=True, null=True)
    col5_blocks = EditorJsJSONField(blank=True, null=True)

    class Meta:
        ordering = ['order', 'id']
        verbose_name = 'Homepage Section'
        verbose_name_plural = 'Homepage Sections'

    def __str__(self):
        return f"{self.title} (#{self.order}, {self.layout})"

    def save(self, *args, **kwargs):
        if not self.anchor_id:
            self.anchor_id = slugify(self.title)[:255]
        super().save(*args, **kwargs)


class VideoPlacement(models.Model):
    POSITION_CHOICES = [
        ('top', 'Top of homepage'),
    ]
    homepage = models.ForeignKey(HomePage, on_delete=models.CASCADE, related_name='video_placements', null=True, blank=True)
    position = models.CharField(max_length=20, choices=POSITION_CHOICES, default='top', help_text='Position where video will appear on homepage')
    title = models.CharField(max_length=255, blank=True, default='', help_text='Optional title for the video')
    video_url = models.URLField(blank=True, default='', help_text='YouTube, Vimeo, or other supported video platform URL')
    video_file = models.FileField(upload_to='uploads/videos/', blank=True, null=True, help_text='Upload local video files (MP4, WebM, OGG)')
    published = models.BooleanField(default=True, help_text='Show/hide this video on the homepage')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Video Placement'
        verbose_name_plural = 'Video Placements'
        ordering = ['-created_at']

    def __str__(self):
        where = dict(self.POSITION_CHOICES).get(self.position, self.position)
        title_display = f": {self.title}" if self.title else ""
        return f"Video {title_display} ({where})"

    def clean(self):
        """Ensure only one video source is provided (URL or file, not both)."""
        super().clean()
        if self.video_url and self.video_file:
            raise ValidationError("Provide either a video URL or upload a video file, not both.")
        if not self.video_url and not self.video_file:
            raise ValidationError("Provide either a video URL or upload a video file.")

    def _to_embed_url(self, url: str) -> str:
        u = (url or '').strip()
        if not u:
            return ''
        # YouTube watch -> embed (nocookie)
        if 'youtube.com/watch' in u:
            from urllib.parse import urlparse, parse_qs
            parsed = urlparse(u)
            qs = parse_qs(parsed.query)
            vid = (qs.get('v') or [''])[0]
            if vid:
                return f"https://www.youtube-nocookie.com/embed/{vid}"
        # youtu.be short links
        if 'youtu.be/' in u:
            try:
                vid = u.split('youtu.be/', 1)[1].split('?')[0]
                if vid:
                    return f"https://www.youtube-nocookie.com/embed/{vid}"
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
        return u

    def as_section(self, request=None) -> dict:
        """Return a section dict compatible with homepage API output."""
        if self.video_file:
            try:
                src = self.video_file.url
                if request is not None:
                    src = request.build_absolute_uri(src)
            except Exception:
                src = ''
            return {
                'type': 'video',
                'title': self.title or '',
                'video_url': src,
            }
        url = self._to_embed_url(self.video_url)
        return {
            'type': 'video',
            'title': self.title or '',
            'video_url': url,
        }


class ContactMessage(models.Model):
    STATUS_CHOICES = [
        ("new", "New"),
        ("in_review", "In Review"),
        ("resolved", "Resolved"),
    ]
    name = models.CharField(max_length=200)
    email = models.EmailField()
    subject = models.CharField(max_length=255, blank=True, default='')
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="new")

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Contact Message"
        verbose_name_plural = "Contact Messages"

    def __str__(self):
        return f"{self.name} — {self.subject or 'No Subject'}"


class Page(models.Model):
    PAGE_TYPES = [
        ('company', 'Company'),
        ('legal', 'Legal'),
    ]
    title = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True)
    page_type = models.CharField(max_length=20, choices=PAGE_TYPES, default='company')
    # Footer menu controls
    show_in_footer = models.BooleanField(default=False)
    footer_order = models.PositiveIntegerField(default=0)
    meta_title = models.CharField(max_length=255, blank=True, default='')
    meta_description = models.TextField(blank=True, default='')
    meta_keywords = models.TextField(blank=True, default='')
    hero_image = models.ImageField(upload_to='pages/hero/', blank=True, null=True)
    # Optional main content (rich) using CKEditor upload field (supports images/videos)
    content = RichTextUploadingField('Content', blank=True, null=True)
    published = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['footer_order', 'title']
        verbose_name = 'Page'
        verbose_name_plural = 'Pages'

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        # Page model has no category/parent_page; remove legacy auto-set logic
        super().save(*args, **kwargs)


class PageSection(models.Model):
    page = models.ForeignKey(Page, on_delete=models.CASCADE, related_name='sections')
    title = models.CharField(max_length=255)
    subtitle = models.CharField(max_length=255, blank=True, default='')
    anchor_id = models.SlugField(max_length=255, blank=True, default='')
    order = models.PositiveIntegerField(default=0)
    collapsible = models.BooleanField(default=True)
    # Visual styles
    background_color = models.CharField(max_length=20, blank=True, default='')
    text_color = models.CharField(max_length=20, blank=True, default='')

    # Section type and layout
    type = models.CharField(
        max_length=20,
        choices=[
            ('rich_text', 'Rich Text'),
            ('rich_columns', 'Rich Columns'),
            ('media', 'Media'),
            ('video', 'Video'),
            ('graph', 'Graph'),
            ('code', 'Code'),
            ('gallery', 'Gallery'),
            ('stats', 'Stats'),
            ('editor', 'Editor Blocks'),
            ('cta', 'CTA')
        ],
        default='rich_text'
    )
    layout = models.CharField(
        max_length=20,
        choices=[
            ('full', 'Full Width'),
            ('split', 'Two Columns'),
            ('grid2', 'Grid (2 Columns)'),
            ('grid3', 'Grid (3 Columns)'),
            ('grid4', 'Grid (4 Columns)'),
            ('grid5', 'Grid (5 Columns)')
        ],
        default='full'
    )
    columns_count = models.PositiveIntegerField(default=1, help_text='1 for full width; 2/3/4 for columns')

    # Common rich/body content
    body = CKEditor5Field('Body', config_name='default', blank=True, null=True)

    # Column titles/subtitles (for rich_columns)
    col1_title = models.CharField(max_length=255, blank=True, default='')
    col1_subtitle = models.CharField(max_length=255, blank=True, default='')
    col2_title = models.CharField(max_length=255, blank=True, default='')
    col2_subtitle = models.CharField(max_length=255, blank=True, default='')
    col3_title = models.CharField(max_length=255, blank=True, default='')
    col3_subtitle = models.CharField(max_length=255, blank=True, default='')
    col4_title = models.CharField(max_length=255, blank=True, default='')
    col4_subtitle = models.CharField(max_length=255, blank=True, default='')
    col5_title = models.CharField(max_length=255, blank=True, default='')
    col5_subtitle = models.CharField(max_length=255, blank=True, default='')

    # Columns (for rich_columns)
    col1_rich = CKEditor5Field('Column 1', config_name='default', blank=True, null=True)
    col2_rich = CKEditor5Field('Column 2', config_name='default', blank=True, null=True)
    col3_rich = CKEditor5Field('Column 3', config_name='default', blank=True, null=True)
    col4_rich = CKEditor5Field('Column 4', config_name='default', blank=True, null=True)
    col5_rich = CKEditor5Field('Column 5', config_name='default', blank=True, null=True)

    # Media section fields
    image = models.ImageField(upload_to='pages/sections/', blank=True, null=True)

    # Video section fields
    video_url = models.URLField(blank=True, default='')

    # Graph section fields
    chart_config = models.JSONField(blank=True, null=True, help_text='{"data": [{"label": "A", "value": 10}, ...]}')

    # Code section fields
    code = models.TextField(blank=True, default='')

    # Gallery section fields
    media_gallery = models.JSONField(blank=True, null=True, help_text='["/media/path1.jpg", "/media/path2.jpg", ...]')

    # Stats section fields
    stats = models.JSONField(blank=True, null=True, help_text='[{"label": "Customers", "value": "1000"}, ...]')

    # CTA section fields
    cta_text = models.CharField(max_length=100, blank=True, default='')
    cta_url = models.URLField(blank=True, default='')

    # EditorJS blocks (single column or per-column)
    editor_blocks = EditorJsJSONField(blank=True, null=True)
    col1_blocks = EditorJsJSONField(blank=True, null=True)
    col2_blocks = EditorJsJSONField(blank=True, null=True)
    col3_blocks = EditorJsJSONField(blank=True, null=True)
    col4_blocks = EditorJsJSONField(blank=True, null=True)
    col5_blocks = EditorJsJSONField(blank=True, null=True)

    class Meta:
        ordering = ['order', 'id']
        verbose_name = 'Page Section'
        verbose_name_plural = 'Page Sections'

    def __str__(self):
        return f"{self.title} (#{self.order}, {self.layout})"

    def save(self, *args, **kwargs):
        if not self.anchor_id:
            self.anchor_id = slugify(self.title)[:255]
        super().save(*args, **kwargs)


# ==== Quotes & Companies (State/ZIP coverage) ====

class InsuranceCompany(models.Model):
    name = models.CharField(max_length=200)
    slug = models.SlugField(max_length=220, unique=True)
    logo = models.ImageField(upload_to="companies/logos/", blank=True, null=True)
    rating = models.DecimalField(max_digits=3, decimal_places=1, blank=True, null=True, help_text="e.g., 4.5 out of 5")
    short_description = models.TextField(blank=True, default='')
    short_url = models.URLField(blank=True, default='', help_text="Display link or promo URL")
    domain_url = models.URLField(blank=True, default='', help_text="Company domain (homepage)")
    landing_url = models.URLField(blank=True, default='', help_text="Primary CTA URL for quotes")
    contact_url = models.URLField(blank=True, default='', help_text="Optional contact/support URL")
    published = models.BooleanField(default=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name"]
        verbose_name = "Insurance Company"
        verbose_name_plural = "Insurance Companies"

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)


class InsuranceCoverage(models.Model):
    """Mapping of company coverage by state and ZIP.

    Admin can:
    - Mark full-state coverage; or
    - Provide ZIP ranges; or
    - Provide explicit ZIP list (comma/space separated)
    Any condition matching will include the company in quotes results.
    """
    company = models.ForeignKey(InsuranceCompany, on_delete=models.CASCADE, related_name='coverages')
    state_code = models.CharField(max_length=2, help_text="US state code, e.g., NY")
    covers_entire_state = models.BooleanField(default=False)
    zip_range_start = models.PositiveIntegerField(blank=True, null=True)
    zip_range_end = models.PositiveIntegerField(blank=True, null=True)
    zip_codes_text = models.TextField(blank=True, default='', help_text="Comma/space separated ZIPs: e.g., 10001,10002 10003")
    notes = models.CharField(max_length=255, blank=True, default='')

    class Meta:
        verbose_name = "Insurance Coverage"
        verbose_name_plural = "Insurance Coverages"
        indexes = [
            models.Index(fields=["state_code"]),
        ]

    def __str__(self):
        label = self.state_code.upper()
        if self.covers_entire_state:
            return f"{self.company.name} — {label} (state-wide)"
        return f"{self.company.name} — {label}"

    def matches_zip(self, zip_code: str) -> bool:
        try:
            z = int(str(zip_code).strip()[:5])
        except Exception:
            return False
        if self.covers_entire_state:
            return True
        # Range handling: support start-only, end-only, and swapped ranges
        if self.zip_range_start or self.zip_range_end:
            try:
                start = int(self.zip_range_start) if self.zip_range_start is not None else None
                end = int(self.zip_range_end) if self.zip_range_end is not None else None
                if start is not None and end is not None:
                    if start > end:
                        start, end = end, start
                    if start <= z <= end:
                        return True
                elif start is not None and start == z:
                    return True
                elif end is not None and end == z:
                    return True
            except Exception:
                pass
        if (self.zip_codes_text or '').strip():
            parts = [p.strip() for p in re.split(r"[\s,]+", self.zip_codes_text) if p.strip()]
            for p in parts:
                # Support explicit ZIPs and simple ranges like '30000-30099' (allow spaces)
                # Normalize en-dash/em-dash to hyphen
                q = p.replace('–', '-').replace('—', '-')
                # Remove any non-digit/non-hyphen characters (handles accidental punctuation)
                q = re.sub(r"[^0-9-]", "", q)
                m = re.match(r"^\s*(\d{5})\s*-\s*(\d{5})\s*$", q)
                if m:
                    try:
                        start = int(m.group(1))
                        end = int(m.group(2))
                        if start <= z <= end:
                            return True
                    except Exception:
                        pass
                elif q.isdigit() and int(q) == z:
                    return True
        return False
