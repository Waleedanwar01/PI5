from django.contrib import admin
from django.utils.html import format_html
from django import forms
from adminsortable2.admin import SortableInlineAdminMixin, SortableAdminBase
from .models import MainPage, Category, Blog, SiteConfig, HomePage, HomePageSection, VideoPlacement, ContactMessage, Page, PageSection, InsuranceCompany, InsuranceCoverage
import re


@admin.register(MainPage)
class MainPageAdmin(admin.ModelAdmin):
    list_display = ("name", "slug", "order", "show_in_header", "has_dropdown")
    list_editable = ("order", "show_in_header", "has_dropdown")
    search_fields = ("name", "slug")


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "slug", "parent_page", "author_info_display", "reviewer_info_display")
    list_filter = ("parent_page",)
    search_fields = ("name", "slug", "blog_author_name", "blog_reviewer_name")
    # Auto-generate slug from category name for clean, consistent slugs
    prepopulated_fields = {"slug": ("name",)}
    fieldsets = (
        (None, {
            'fields': ("name", "slug", "parent_page")
        }),
        ("Blog Content", {
            'classes': ("collapse",),
            'fields': ("blog_published", "blog_title", "blog_summary", "blog_content"),
            'description': "Category ke neeche directly blog likhne ke liye editor (alag Blog section ki zaroorat nahi)."
        }),
        ("Author Information", {
            'classes': ("collapse",),
            'fields': ("blog_author_name", "blog_author_image", "blog_author_description"),
            'description': "Blog ke liye author ki details (naam, tasveer, chhota description)."
        }),
        ("Reviewer Information", {
            'classes': ("collapse",),
            'fields': ("blog_reviewer_name", "blog_reviewer_image", "blog_reviewer_description"),
            'description': "Blog ke liye reviewer ki details (naam, tasveer, chhota description)."
        }),
    )

    def author_info_display(self, obj):
        """Display author information in admin list view"""
        if obj.blog_author_name:
            if obj.blog_author_image and hasattr(obj.blog_author_image, 'url'):
                return format_html(
                    '<div style="display: flex; align-items: center;">'
                    '<img src="{}" style="height:30px;width:30px;border-radius:50%;object-fit:cover;margin-right:10px;" />'
                    '<div><strong>{}</strong><br><small>{}</small></div>'
                    '</div>',
                    obj.blog_author_image.url,
                    obj.blog_author_name,
                    obj.blog_author_description[:50] + "..." if obj.blog_author_description and len(obj.blog_author_description) > 50 else (obj.blog_author_description or "")
                )
            else:
                return format_html(
                    '<div><strong>{}</strong><br><small>{}</small></div>',
                    obj.blog_author_name,
                    obj.blog_author_description[:50] + "..." if obj.blog_author_description and len(obj.blog_author_description) > 50 else (obj.blog_author_description or "No description")
                )
        return "No author assigned"
    author_info_display.short_description = "Author"

    def reviewer_info_display(self, obj):
        """Display reviewer information in admin list view"""
        if obj.blog_reviewer_name:
            if obj.blog_reviewer_image and hasattr(obj.blog_reviewer_image, 'url'):
                return format_html(
                    '<div style="display: flex; align-items: center;">'
                    '<img src="{}" style="height:30px;width:30px;border-radius:50%;object-fit:cover;margin-right:10px;" />'
                    '<div><strong>{}</strong><br><small>{}</small></div>'
                    '</div>',
                    obj.blog_reviewer_image.url,
                    obj.blog_reviewer_name,
                    obj.blog_reviewer_description[:50] + "..." if obj.blog_reviewer_description and len(obj.blog_reviewer_description) > 50 else (obj.blog_reviewer_description or "")
                )
            else:
                return format_html(
                    '<div><strong>{}</strong><br><small>{}</small></div>',
                    obj.blog_reviewer_name,
                    obj.blog_reviewer_description[:50] + "..." if obj.blog_reviewer_description and len(obj.blog_reviewer_description) > 50 else (obj.blog_reviewer_description or "No description")
                )
        return "No reviewer assigned"
    reviewer_info_display.short_description = "Reviewer"

    class Media:
        css = {
            'all': (
                'content/admin/blog_filter.css',
            )
        }


@admin.register(Blog)
class BlogAdmin(admin.ModelAdmin):
    list_display = ("title", "slug", "parent_page", "category", "published", "author_name", "author_image_thumb", "created_at")
    list_filter = ("published", "parent_page", "category")
    search_fields = ("title", "slug", "summary")
    # Hide hero image option from Blog admin
    exclude = ("hero_image",)
    # Slug is computed from category or title; make read-only in admin
    readonly_fields = ("slug",)
    # Use regular selects for reliable client-side filtering
    # autocomplete_fields = ("parent_page",)

    def get_form(self, request, obj=None, **kwargs):
        form = super().get_form(request, obj, **kwargs)
        # Filter categories by selected parent_page. If none selected yet, show none.
        from .models import Category
        parent_page_id = None
        if request.method == 'POST':
            parent_page_id = request.POST.get('parent_page')
        elif obj and obj.parent_page_id:
            parent_page_id = obj.parent_page_id

        if parent_page_id:
            form.base_fields['category'].queryset = Category.objects.filter(parent_page_id=parent_page_id)
        else:
            form.base_fields['category'].queryset = Category.objects.none()
        return form

    class Media:
        js = (
            "content/admin/blog_filter.js",
            "content/admin/blog_category_preview.js",
        )

    def author_image_thumb(self, obj):
        if obj.author_image and getattr(obj.author_image, 'url', None):
            return format_html('<img src="{}" style="height:32px;width:32px;border-radius:50%;object-fit:cover;" />', obj.author_image.url)
        return '-'
    author_image_thumb.short_description = 'Author Image'

    def save_model(self, request, obj, form, change):
        # Set created_by on first create
        if not change and not obj.created_by:
            obj.created_by = request.user
        super().save_model(request, obj, form, change)

# Hide Blog from admin as per request (category-level editor only)
try:
    admin.site.unregister(Blog)
except Exception:
    pass


@admin.register(SiteConfig)
class SiteConfigAdmin(admin.ModelAdmin):
    class SiteConfigForm(forms.ModelForm):
        class Meta:
            from .models import SiteConfig
            model = SiteConfig
            fields = '__all__'
            widgets = {
                'accent_orange_hex': forms.TextInput(attrs={'type': 'color'}),
                'accent_orange_hover_hex': forms.TextInput(attrs={'type': 'color'}),
                'accent_gradient_from_hex': forms.TextInput(attrs={'type': 'color'}),
                'accent_gradient_to_hex': forms.TextInput(attrs={'type': 'color'}),
            }

    list_display = ("brand_name", "email", "phone_number", "updated_at")
    readonly_fields = ("updated_at",)
    form = SiteConfigForm
    fieldsets = (
        (None, {
            'fields': ("brand_name", "hero_title", "tagline", "email", "phone_number", "disclaimer")
        }),
        ("Branding", {
            'fields': ("logo", "logo_icon", "favicon", "logo_height_px", "accent_orange_hex", "accent_orange_hover_hex", "accent_gradient_from_hex", "accent_gradient_to_hex")
        }),
        ("Social Links", {
            'fields': ("facebook_url", "twitter_url", "instagram_url", "youtube_url", "linkedin_url")
        }),
        ("Theme Controls", {
            'fields': (
                "buttons_border_width_px", "buttons_radius_px", "buttons_uppercase", "buttons_font_weight",
                "headings_font_weight", "links_underline", "links_font_weight"
            ),
            'description': "Style controls (colors managed separately under Branding)."
        }),
        ("Footer", {
            'fields': ("copyright_text", "footer_about_text", "company_address")
        }),
        ("System", {
            'fields': ("updated_at",)
        }),
    )

    # Hide deprecated fields from the admin form
    def get_form(self, request, obj=None, **kwargs):
        form = super().get_form(request, obj, **kwargs)
        for fname in ("social_links", "social_links_text", "footer_company_links", "footer_legal_links"):
            if fname in form.base_fields:
                form.base_fields.pop(fname)
        return form

    def has_add_permission(self, request):
        # Allow add only if none exists
        return not SiteConfig.objects.exists()

    def has_delete_permission(self, request, obj=None):
        # Allow delete so a new one can be created afterward
        return True


class HomePageSectionInline(SortableInlineAdminMixin, admin.StackedInline):
    model = HomePageSection
    extra = 0
    readonly_fields = ("id",)
    fieldsets = (
        (None, {
            'fields': ("order", "title", "subtitle", "anchor_id", "collapsible", "type", "layout", "columns_count", "background_color", "text_color", "id")
        }),
        ("Full Width Body", {
            'classes': ('collapse',),
            'fields': ("body",)
        }),
        ("Editor Blocks", {
            'classes': ('collapse',),
            'fields': ("editor_blocks",)
        }),
        ("Columns Content", {
            'classes': ('collapse',),
            'fields': (
                # Titles/subtitles per column
                "col1_title", "col1_subtitle",
                "col2_title", "col2_subtitle",
                "col3_title", "col3_subtitle",
                "col4_title", "col4_subtitle",
                "col5_title", "col5_subtitle",
                # Editors per column
                "col1_rich", "col2_rich", "col3_rich", "col4_rich", "col5_rich",
                # Optional EditorJS blocks per column
                "col1_blocks", "col2_blocks", "col3_blocks", "col4_blocks", "col5_blocks"
            )
        }),
        ("Media", {
            'classes': ('collapse',),
            'fields': ("image",)
        }),
        ("Video", {
            'classes': ('collapse',),
            'fields': ("video_url",)
        }),
        ("Graph", {
            'classes': ('collapse',),
            'fields': ("chart_config",)
        }),
        ("Code", {
            'classes': ('collapse',),
            'fields': ("code",)
        }),
        ("Gallery", {
            'classes': ('collapse',),
            'fields': ("media_gallery",)
        }),
        ("Stats", {
            'classes': ('collapse',),
            'fields': ("stats",)
        }),
        ("CTA", {
            'classes': ('collapse',),
            'fields': ("cta_text", "cta_url")
        }),
    )
    ordering = ("order", "id")
    sortable = 'order'

    # Remove the ability to add new sections from the inline editor
    def has_add_permission(self, request, obj):
        return False

    class Media:
        js = ("content/admin/homepage_sections.js",)


class VideoPlacementInline(admin.StackedInline):
    model = VideoPlacement
    extra = 0
    fields = ("position", "title", "published", "video_file", "video_url")
    verbose_name_plural = "Homepage Videos"
    show_change_link = True

    def formfield_for_choice_field(self, db_field, request, **kwargs):
        # Restrict position to only 'top' to avoid confusion
        if db_field.name == 'position':
            kwargs['choices'] = [("top", "Top of homepage")]
        return super().formfield_for_choice_field(db_field, request, **kwargs)

    def formfield_for_dbfield(self, db_field, request, **kwargs):
        if db_field.name == 'video_url':
            kwargs['help_text'] = (
                'Supported video platforms:\n'
                '• YouTube: https://www.youtube.com/watch?v=VIDEO_ID\n'
                '• YouTube Shorts: https://youtu.be/VIDEO_ID\n'
                '• Vimeo: https://vimeo.com/VIDEO_ID\n'
                '• Upload local video files using the video_file field instead\n'
                '\n'
                'Video will be automatically embedded and displayed on the homepage.'
            )
        elif db_field.name == 'video_file':
            kwargs['help_text'] = (
                'Upload local video files (MP4, WebM, OGG). \n'
                'Large files may affect page loading time. \n'
                'For better performance, consider using video_url for YouTube/Vimeo videos.'
            )
        elif db_field.name == 'title':
            kwargs['help_text'] = (
                'Optional title for the video. Leave blank for no title display.'
            )
        return super().formfield_for_dbfield(db_field, request, **kwargs)

@admin.register(HomePage)
class HomePageAdmin(SortableAdminBase, admin.ModelAdmin):
    list_display = ("id", "meta_title", "updated_at")
    readonly_fields = ("updated_at",)
    fieldsets = (
        (None, {
            'fields': ("meta_title", "meta_description", "meta_keywords")
        }),
        ("Hero", {
            'fields': ("hero_image",)
        }),
        ("Optional Content", {
            'fields': ("content",)
        }),
        ("System", {
            'fields': ("updated_at",)
        }),
    )
    # Manage homepage sections and top videos directly inside HomePage via inline
    inlines = [HomePageSectionInline, VideoPlacementInline]

    def get_form(self, request, obj=None, **kwargs):
        form = super().get_form(request, obj, **kwargs)
        # Clarify website/homepage title with English help
        if 'meta_title' in form.base_fields:
            form.base_fields['meta_title'].label = 'Website Title (Homepage)'
            form.base_fields['meta_title'].help_text = 'This title is used as the website homepage title.'
        # Hide homepage CTA and anchor fields by not including them in fieldsets
        return form

    class Media:
        css = {
            'all': (
                'content/admin/homepage_editor.css',
            )
        }
        # No loader needed; plugin is served from /static/ckeditor/plugins/setid/
    
    def formfield_for_dbfield(self, db_field, request, **kwargs):
        if db_field.name == 'content':
            kwargs['help_text'] = (
                'Editor guide (CKEditor v4):\n'
                '\n'
                '- Text & Headings: Type normally. Use the Format menu (p, h2–h4).\n'
                '- Images: Click the Image button → Image Info tab for URL or the Upload tab to choose a file from your computer → set Alt text, alignment and size → Insert.\n'
                '- Videos: Embed a YouTube/Vimeo link or upload a local video file. For placement, use "Video Placements" (Top/Bottom).\n'
                '- Buttons: Select text → add a Link (URL or #id) → apply Styles → "Button" or "Primary Button". Alternatively, in Link → Advanced, set class to "btn" or "btn btn-primary".\n'
                '- Anchors/IDs: Select a heading or text → use the Set ID toolbar button → enter a unique id (e.g., advantages). Then link to it with href="#advantages".\n'
                '- Open in new tab: In the Link dialog, set Target to New Window (_blank) or add rel="noopener" in Advanced.\n'
                '- Lists, tables, alignment: Use the toolbar (bulleted/numbered lists, table insert, left/center/right alignment).\n'
                '\n'
                'Tips: Keep IDs unique; avoid spaces in IDs; large local videos can affect page load. All standard HTML is allowed (allowedContent=True).'
            )
        return super().formfield_for_dbfield(db_field, request, **kwargs)
    
    def has_add_permission(self, request):
        # Allow add only if none exists
        from .models import HomePage
        return not HomePage.objects.exists()

    def has_delete_permission(self, request, obj=None):
        # Explicitly allow delete so a new one can be created later
        return True

    def save_model(self, request, obj, form, change):
        # Do not modify homepage content; save as entered
        super().save_model(request, obj, form, change)


# Standalone VideoPlacement admin removed; manage via HomePage inline only


@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    list_display = ("name", "email", "subject", "status", "created_at")
    list_filter = ("status", "created_at")
    search_fields = ("name", "email", "subject", "message")
    readonly_fields = ("created_at",)


class PageSectionInline(SortableInlineAdminMixin, admin.StackedInline):
    model = PageSection
    extra = 0
    readonly_fields = ("id",)
    fieldsets = (
        (None, {
            'fields': ("order", "title", "subtitle", "anchor_id", "collapsible", "type", "layout", "columns_count", "background_color", "text_color", "id")
        }),
        ("Full Width Body", {
            'classes': ('collapse',),
            'fields': ("body",)
        }),
        ("Editor Blocks", {
            'classes': ('collapse',),
            'fields': ("editor_blocks",)
        }),
        ("Columns Content", {
            'classes': ('collapse',),
            'fields': (
                "col1_title", "col1_subtitle",
                "col2_title", "col2_subtitle",
                "col3_title", "col3_subtitle",
                "col4_title", "col4_subtitle",
                "col5_title", "col5_subtitle",
                "col1_rich", "col2_rich", "col3_rich", "col4_rich", "col5_rich",
                "col1_blocks", "col2_blocks", "col3_blocks", "col4_blocks", "col5_blocks"
            )
        }),
        ("Media", {
            'classes': ('collapse',),
            'fields': ("image",)
        }),
        ("Video", {
            'classes': ('collapse',),
            'fields': ("video_url",)
        }),
        ("Graph", {
            'classes': ('collapse',),
            'fields': ("chart_config",)
        }),
        ("Code", {
            'classes': ('collapse',),
            'fields': ("code",)
        }),
        ("Gallery", {
            'classes': ('collapse',),
            'fields': ("media_gallery",)
        }),
        ("Stats", {
            'classes': ('collapse',),
            'fields': ("stats",)
        }),
        ("CTA", {
            'classes': ('collapse',),
            'fields': ("cta_text", "cta_url")
        }),
    )
    ordering = ("order", "id")
    sortable = 'order'


@admin.register(Page)
class PageAdmin(SortableAdminBase, admin.ModelAdmin):
    list_display = ("title", "slug", "page_type", "show_in_footer", "footer_order", "published", "updated_at")
    list_editable = ("show_in_footer", "footer_order")
    list_filter = ("page_type", "published", "show_in_footer")
    search_fields = ("title", "slug", "meta_title")
    readonly_fields = ("created_at", "updated_at")
    fieldsets = (
        (None, {
            'fields': ("title", "slug", "page_type", "published")
        }),
        ("Footer Menu", {
            'fields': ("show_in_footer", "footer_order")
        }),
        ("Meta", {
            'fields': ("meta_title", "meta_description", "meta_keywords")
        }),
        ("Hero", {
            'fields': ("hero_image",)
        }),
        ("Optional Content", {
            'fields': ("content",)
        }),
        ("System", {
            'fields': ("created_at", "updated_at")
        }),
    )
    inlines = [PageSectionInline]
    prepopulated_fields = {"slug": ("title",)}


# ==== Insurance Companies & Coverage ====

# Simple US states list for admin multi-select
US_STATES = [
    'AL','AK','AZ','AR','CA','CO','CT','DC','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY'
]

class InsuranceCoverageInline(admin.TabularInline):
    model = InsuranceCoverage
    extra = 0
    fields = ("state_code", "covers_entire_state", "zip_range_start", "zip_range_end", "zip_codes_text", "notes")
    show_change_link = False


@admin.register(InsuranceCompany)
class InsuranceCompanyAdmin(admin.ModelAdmin):
    class InsuranceCompanyCoverageForm(forms.ModelForm):
        states_multi = forms.MultipleChoiceField(
            choices=[(s, s) for s in US_STATES],
            required=False,
            help_text="Select states for statewide coverage (adds/updates coverages)."
        )
        nationwide_all = forms.BooleanField(
            required=False,
            help_text="If checked, company will be marked statewide in all states."
        )

        class Meta:
            from .models import InsuranceCompany as IC
            model = IC
            fields = '__all__'

    list_display = ("name", "rating", "published", "updated_at")
    list_filter = ("published",)
    search_fields = ("name", "short_description")
    readonly_fields = ("updated_at",)
    fieldsets = (
        (None, {
            'fields': ("name", "slug", "logo", "rating", "published")
        }),
        ("Links", {
            'fields': ("short_url", "domain_url", "landing_url", "contact_url")
        }),
        ("Description", {
            'fields': ("short_description",)
        }),
        ("Coverage Shortcut", {
            'fields': ("states_multi", "nationwide_all"),
            'description': "Quick method: select states here to add/update statewide coverage. Selecting 'All states' will mark coverage in all states."
        }),
        ("System", {
            'fields': ("updated_at",)
        })
    )
    prepopulated_fields = {"slug": ("name",)}
    form = InsuranceCompanyCoverageForm
    inlines = [InsuranceCoverageInline]

    def save_model(self, request, obj, form, change):
        super().save_model(request, obj, form, change)
        try:
            states = form.cleaned_data.get('states_multi') or []
            nationwide = bool(form.cleaned_data.get('nationwide_all'))
        except Exception:
            states, nationwide = [], False

        # If nationwide, override with all states
        if nationwide:
            states = US_STATES

        # Create or update statewide coverages for selected states
        created_or_updated = 0
        for st in states:
            try:
                cov, _created = InsuranceCoverage.objects.get_or_create(company=obj, state_code=st)
                cov.covers_entire_state = True
                cov.zip_range_start = None
                cov.zip_range_end = None
                cov.zip_codes_text = ''
                cov.save()
                created_or_updated += 1
            except Exception:
                continue

        if created_or_updated:
            try:
                self.message_user(request, f"Statewide coverage updated for {created_or_updated} state(s).")
            except Exception:
                pass


@admin.register(InsuranceCoverage)
class InsuranceCoverageAdmin(admin.ModelAdmin):
    list_display = ("company", "state_code", "covers_entire_state", "zip_range_start", "zip_range_end")
    list_filter = ("state_code", "covers_entire_state")
    search_fields = ("company__name", "state_code", "zip_codes_text")