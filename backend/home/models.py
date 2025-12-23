from django.db import models
from wagtail.models import Page
from wagtail.fields import StreamField, RichTextField
from wagtail import blocks
from wagtail.admin.panels import FieldPanel
from wagtail.images.blocks import ImageChooserBlock
from wagtail.documents.blocks import DocumentChooserBlock
from wagtail.contrib.table_block.blocks import TableBlock


class HomePage(Page):
    subtitle = models.CharField(max_length=255, blank=True, default='')
    hero_image = models.ForeignKey(
        'wagtailimages.Image', null=True, blank=True,
        on_delete=models.SET_NULL, related_name='+'
    )
    intro = RichTextField(blank=True)
    body = StreamField(
        [
            # New: Section block that groups rows/columns with an anchor id
            ('section', blocks.StructBlock([
                ('title', blocks.CharBlock(required=False)),
                ('subtitle', blocks.CharBlock(required=False)),
                ('anchor_id', blocks.CharBlock(required=False)),
                ('optional_content', blocks.RichTextBlock(required=False, features=[
                    'bold', 'italic', 'link', 'ol', 'ul', 'hr', 'image', 'embed', 'code',
                    'h2', 'h3', 'h4', 'blockquote', 'table'
                ])),
                ('collapsible', blocks.BooleanBlock(required=False, help_text='Make section content collapsible')),
                ('layout', blocks.ChoiceBlock(choices=[
                    ('full', 'Full Width'),
                    ('split', 'Two Columns'),
                    ('grid2', 'Grid 2'),
                    ('grid3', 'Grid 3'),
                ], required=False)),
                ('content', blocks.StreamBlock([
                    ('rich_text', blocks.RichTextBlock(features=[
                        'bold', 'italic', 'link', 'ol', 'ul', 'hr', 'image', 'embed', 'code',
                        'h2', 'h3', 'h4', 'blockquote', 'table'
                    ])),
                    ('columns2', blocks.StructBlock([
                        ('col1', blocks.RichTextBlock(features=['bold', 'italic', 'link', 'ol', 'ul', 'image', 'embed', 'h3', 'h4', 'table'])),
                        ('col2', blocks.RichTextBlock(features=['bold', 'italic', 'link', 'ol', 'ul', 'image', 'embed', 'h3', 'h4', 'table'])),
                    ])),
                    ('columns3', blocks.StructBlock([
                        ('col1', blocks.RichTextBlock(features=['bold', 'italic', 'link', 'ol', 'ul', 'image', 'embed', 'h3', 'h4', 'table'])),
                        ('col2', blocks.RichTextBlock(features=['bold', 'italic', 'link', 'ol', 'ul', 'image', 'embed', 'h3', 'h4', 'table'])),
                        ('col3', blocks.RichTextBlock(features=['bold', 'italic', 'link', 'ol', 'ul', 'image', 'embed', 'h3', 'h4', 'table'])),
                    ])),
                    ('image', ImageChooserBlock()),
                    ('embed', blocks.URLBlock(help_text='Paste video or media URL (YouTube, etc.)')),
                    ('table', TableBlock()),
                    ('document', blocks.StructBlock([
                        ('document', DocumentChooserBlock()),
                        ('title', blocks.CharBlock(required=False)),
                        ('description', blocks.TextBlock(required=False)),
                    ])),
                    ('tags', blocks.ListBlock(blocks.CharBlock())),
                    ('chart', blocks.StructBlock([
                        ('title', blocks.CharBlock(required=False)),
                        ('data', blocks.ListBlock(blocks.StructBlock([
                            ('label', blocks.CharBlock()),
                            ('value', blocks.FloatBlock()),
                        ]))),
                    ])),
                ], required=False)),
            ])),
            # Backwards-compatible top-level blocks
            ('rich_text', blocks.RichTextBlock(features=[
                'bold', 'italic', 'link', 'ol', 'ul', 'hr', 'image', 'embed', 'code',
                'h2', 'h3', 'h4', 'blockquote', 'table'
            ])),
            ('columns2', blocks.StructBlock([
                ('col1', blocks.RichTextBlock(features=['bold', 'italic', 'link', 'ol', 'ul', 'image', 'embed', 'h3', 'h4', 'table'])),
                ('col2', blocks.RichTextBlock(features=['bold', 'italic', 'link', 'ol', 'ul', 'image', 'embed', 'h3', 'h4', 'table'])),
            ])),
            ('columns3', blocks.StructBlock([
                ('col1', blocks.RichTextBlock(features=['bold', 'italic', 'link', 'ol', 'ul', 'image', 'embed', 'h3', 'h4', 'table'])),
                ('col2', blocks.RichTextBlock(features=['bold', 'italic', 'link', 'ol', 'ul', 'image', 'embed', 'h3', 'h4', 'table'])),
                ('col3', blocks.RichTextBlock(features=['bold', 'italic', 'link', 'ol', 'ul', 'image', 'embed', 'h3', 'h4', 'table'])),
            ])),
            ('image', ImageChooserBlock()),
            ('embed', blocks.URLBlock()),
        ],
        use_json_field=True,
        blank=True,
    )

    parent_page_types = []
    subpage_types = []

    content_panels = Page.content_panels + [
        FieldPanel('subtitle'),
        FieldPanel('hero_image'),
        FieldPanel('intro'),
        FieldPanel('body'),
    ]

    class Meta:
        verbose_name = 'Wagtail Homepage'
        verbose_name_plural = 'Wagtail Homepage'