from django.http import JsonResponse, HttpResponse
from django.views.decorators.cache import never_cache
from django.views.decorators.csrf import csrf_exempt
from django.db.models import Q
from django.core.paginator import Paginator
from django.utils.text import slugify
from django.core.exceptions import ValidationError
from django.template.loader import render_to_string
from .models import Blog, SiteConfig, HomePage, HomePageSection, MainPage, Category, Page, PageSection, PressLogo, TeamMember, ContactMessage
import json

# Footer address function
def get_footer_address(request):
    try:
        article_with_address = Blog.objects.filter(
            footer_address__isnull=False,
            footer_address__gt=''
        ).order_by('-created_at').first()
        
        if article_with_address:
            return JsonResponse({
                'address': article_with_address.footer_address,
                'source': 'article',
                'article_title': article_with_address.title
            })
        
        site_config = SiteConfig.objects.first()
        if site_config and site_config.company_address:
            return JsonResponse({
                'address': site_config.company_address,
                'source': 'site_config',
                'article_title': 'Site Configuration'
            })
        
        return JsonResponse({
            'address': '',
            'source': 'none',
            'article_title': ''
        })
    except Exception as e:
        return JsonResponse({
            'error': str(e),
            'address': '',
            'source': 'error',
            'article_title': ''
        }, status=500)

@never_cache
def homepage(request):
    try:
        homepage_config = HomePage.objects.first()
        if not homepage_config:
            return JsonResponse({'sections': []})
        
        def get_absolute_url(relative_url):
            if not relative_url:
                return None
            if relative_url.startswith('http'):
                return relative_url
            return request.build_absolute_uri(relative_url)
        
        sections = []
        for section in HomePageSection.objects.filter(homepage=homepage_config).order_by('order'):
            section_data = {
                'id': section.id,
                'type': section.type,
                'layout': section.layout,
                'title': section.title,
                'subtitle': section.subtitle,
                'anchor_id': section.anchor_id,
                'background_color': section.background_color,
                'text_color': section.text_color,
            }
            
            if section.type == 'rich_text':
                section_data['body'] = section.body
            elif section.type == 'rich_columns':
                section_data.update({
                    'col1_title': section.col1_title,
                    'col1_subtitle': section.col1_subtitle,
                    'col1_rich': section.col1_rich,
                    'col2_title': section.col2_title,
                    'col2_subtitle': section.col2_subtitle,
                    'col2_rich': section.col2_rich,
                    'col3_title': section.col3_title,
                    'col3_subtitle': section.col3_subtitle,
                    'col3_rich': section.col3_rich,
                    'col4_title': section.col4_title,
                    'col4_subtitle': section.col4_subtitle,
                    'col4_rich': section.col4_rich,
                    'col5_title': section.col5_title,
                    'col5_subtitle': section.col5_subtitle,
                    'col5_rich': section.col5_rich,
                })
            
            sections.append(section_data)

        # Fetch PressLogos
        press_logos_data = []
        for logo in PressLogo.objects.all().order_by('order'):
            press_logos_data.append({
                'name': logo.name,
                'image': get_absolute_url(logo.image.url) if logo.image else None,
            })
            
        return JsonResponse({
            'meta': {
                'meta_title': homepage_config.meta_title,
                'meta_description': homepage_config.meta_description,
                'meta_keywords': homepage_config.meta_keywords,
                'hero_image': get_absolute_url(homepage_config.hero_image.url) if homepage_config.hero_image else None,
                'content': homepage_config.content,
            },
            'press_logos': press_logos_data,
            'sections': sections
        })
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@never_cache
def site_config(request):
    try:
        config = SiteConfig.objects.first()
        if not config:
            return JsonResponse({})
        
        def get_absolute_url(relative_url):
            if not relative_url:
                return None
            if relative_url.startswith('http'):
                return relative_url
            return request.build_absolute_uri(relative_url)

        return JsonResponse({
            'brand_name': config.brand_name,
            'hero_title': config.hero_title,
            'tagline': config.tagline,
            'email': config.email,
            'phone_number': config.phone_number,
            'disclaimer': config.disclaimer,
            'logo_url': get_absolute_url(config.logo.url) if config.logo else None,
            'logo_icon_url': get_absolute_url(config.logo_icon.url) if config.logo_icon else None,
            'favicon_url': get_absolute_url(config.favicon.url) if config.favicon else None,
            'logo_height_px': config.logo_height_px,
            'accent_orange_hex': config.accent_orange_hex,
            'accent_orange_hover_hex': config.accent_orange_hover_hex,
            'accent_gradient_from_hex': config.accent_gradient_from_hex,
            'accent_gradient_to_hex': config.accent_gradient_to_hex,
            'facebook_url': config.facebook_url,
            'twitter_url': config.twitter_url,
            'instagram_url': config.instagram_url,
            'youtube_url': config.youtube_url,
            'linkedin_url': config.linkedin_url,
            'copyright_text': config.copyright_text,
            'footer_about_text': config.footer_about_text,
            'company_address': config.company_address,
            'updated_at': config.updated_at
        })
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@never_cache
def main_pages(request):
    try:
        pages = MainPage.objects.filter(show_in_header=True).order_by('order')
        return JsonResponse({
            'pages': [{
                'name': p.name,
                'slug': p.slug,
                'has_dropdown': p.has_dropdown,
                'meta_title': p.meta_title,
                'meta_description': p.meta_description,
                'meta_keywords': p.meta_keywords,
            } for p in pages]
        })
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@never_cache
def menu_footer(request):
    try:
        # Fetch ALL published pages regardless of show_in_footer setting
        company_pages = Page.objects.filter(page_type='company', published=True).order_by('footer_order', 'title')
        legal_pages = Page.objects.filter(page_type='legal', published=True).order_by('footer_order', 'title')
        
        return JsonResponse({
            # Map 'title' to 'name' for frontend compatibility
            'company': [{'name': p.title, 'slug': p.slug} for p in company_pages],
            'legal': [{'name': p.title, 'slug': p.slug} for p in legal_pages]
        })
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@never_cache
def categories_for_page(request):
    return JsonResponse({'categories': []})

@never_cache
def categories_api(request):
    try:
        cats = Category.objects.all()
        return JsonResponse({
            'categories': [{
                'id': c.id,
                'name': c.name,
                'slug': c.slug,
                'parent_page': c.parent_page.slug if c.parent_page else None
            } for c in cats]
        })
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@never_cache
def blogs_list(request):
    try:
        page = int(request.GET.get('page', 1))
        page_size = int(request.GET.get('page_size', 10))
        search = request.GET.get('search', '')
        category_slug = request.GET.get('category', '')
        parent_page_slug = request.GET.get('parent_page', '')
        
        # 1. Fetch Blogs
        blog_query = Q(published=True)
        if search:
            blog_query &= Q(title__icontains=search) | Q(summary__icontains=search)
        if category_slug:
            blog_query &= Q(category__slug=category_slug)
        if parent_page_slug:
            blog_query &= Q(parent_page__slug=parent_page_slug)
            
        blogs = list(Blog.objects.filter(blog_query).order_by('-created_at'))

        # 2. Fetch Categories (that act as Blogs)
        # Only include categories if we are NOT filtering by a specific category
        # (Because a Category doesn't belong to another Category)
        # OR if the user is searching (we want to find matching categories)
        cats = []
        if not category_slug or search:
            cat_query = Q(blog_published=True)
            if search:
                cat_query &= Q(name__icontains=search) | Q(blog_title__icontains=search) | Q(blog_summary__icontains=search)
            if parent_page_slug:
                cat_query &= Q(parent_page__slug=parent_page_slug)
            
            # If filtering by category, strictly we shouldn't show other categories.
            # But if searching, we might match a category name.
            if category_slug:
                 # If filtering by category, we usually don't show categories unless... 
                 # maybe we skip adding categories to the list if a category filter is active.
                 # Let's respect the "Not filtering by category" rule for now.
                 cat_query &= Q(slug=category_slug) # Only show the category itself if it matches?

            if not category_slug:
                cats = list(Category.objects.filter(cat_query))
        
        # 3. Combine
        # We want Categories to appear as "Featured" or "Pillar" content, perhaps at the top?
        # Since they don't have created_at, we can't easily interleave by date.
        # Let's prepend them.
        combined_items = cats + blogs
        
        paginator = Paginator(combined_items, page_size)
        page_obj = paginator.get_page(page)
        
        def get_absolute_url(relative_url):
            if not relative_url:
                return None
            if relative_url.startswith('http'):
                return relative_url
            return request.build_absolute_uri(relative_url)

        results = []
        for item in page_obj:
            if isinstance(item, Blog):
                results.append({
                    'id': item.id,
                    'title': item.title,
                    'slug': item.slug,
                    'summary': item.summary,
                    'hero_image': get_absolute_url(item.hero_image.url) if item.hero_image else None,
                    'category': item.category.name if item.category else None,
                    'created_at': item.created_at
                })
            elif isinstance(item, Category):
                 # Map Category to Blog-like structure
                 results.append({
                    'id': f"cat-{item.id}",
                    'title': item.blog_title or item.name,
                    'slug': item.slug,
                    'summary': item.blog_summary,
                    # Categories might not have a hero image field on the model directly (unless added)
                    # For now send None or maybe check if there's an author image we can abuse? No.
                    'hero_image': None, 
                    'category': "Guide", # Label them as Guides or similar? Or just use their own name?
                    # Since they ARE the category, maybe label them with their Parent Page?
                    'category_label': item.parent_page.name if item.parent_page else "Guide",
                    'created_at': None # No date
                })

        return JsonResponse({
            'blogs': results,
            'pagination': {
                'total_count': paginator.count,
                'total_pages': paginator.num_pages,
                'current_page': page,
                'has_next': page_obj.has_next(),
                'has_previous': page_obj.has_previous()
            }
        })
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@never_cache
def pages_with_categories(request):
    try:
        # Use MainPage as it holds the category structure for the navbar
        pages = MainPage.objects.filter(show_in_header=True).prefetch_related('categories').order_by('order')
        
        return JsonResponse({
            'pages': [{
                'name': p.name,
                'slug': p.slug,
                'has_dropdown': p.has_dropdown,
                'categories': [{
                    'name': c.name, 
                    'slug': c.slug
                } for c in p.categories.all()]
            } for p in pages]
        })
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

# Blog detail API
@never_cache
def blog_detail(request, slug):
    try:
        # Build absolute URL for media files
        def get_absolute_url(relative_url):
            if not relative_url:
                return None
            if relative_url.startswith('http'):
                return relative_url
            return request.build_absolute_uri(relative_url)
        
        # Try to find in Blog model first
        try:
            blog = Blog.objects.get(slug=slug, published=True)
            
            # Get related content from same parent page
            related_blogs = []
            if blog.parent_page:
                # 1. Fetch related Blogs
                related_b = Blog.objects.filter(
                    parent_page=blog.parent_page, 
                    published=True
                ).exclude(id=blog.id)

                # 2. Fetch related Categories (acting as blogs)
                related_c = Category.objects.filter(
                    parent_page=blog.parent_page,
                    blog_published=True
                )

                # Combine and take first 3
                combined = list(related_b) + list(related_c)
                for item in combined[:3]:
                    if isinstance(item, Blog):
                        related_blogs.append({
                            'id': item.id,
                            'title': item.title,
                            'slug': item.slug,
                            'summary': item.summary,
                            'hero_image': get_absolute_url(item.hero_image.url) if item.hero_image else None,
                            'category': item.category.name if item.category else None,
                            'created_at': item.created_at.isoformat() if item.created_at else None,
                        })
                    elif isinstance(item, Category):
                        related_blogs.append({
                            'id': f'cat-{item.id}',
                            'title': item.blog_title or item.name,
                            'slug': item.slug,
                            'summary': item.blog_summary or '',
                            'hero_image': None,
                            'category': item.name,
                            'created_at': None,
                        })
            
            return JsonResponse({
                'blog': {
                    'id': blog.id,
                    'title': blog.title,
                    'slug': blog.slug,
                    'summary': blog.summary,
                    'content': blog.content,
                    'content_html': blog.content,
                    'hero_image': get_absolute_url(blog.hero_image.url) if blog.hero_image else None,
                    'category': blog.category.name if blog.category else None,
                    'category_slug': blog.category.slug if blog.category else None,
                    'parent_page': blog.parent_page.slug if blog.parent_page else None,
                    'author': blog.author_name,
                    'author_image': get_absolute_url(blog.author_image.url) if blog.author_image else None,
                    'author_description': blog.author_description,
                    'reviewer': blog.reviewer_name,
                    'reviewer_image': get_absolute_url(blog.reviewer_image.url) if blog.reviewer_image else None,
                    'reviewer_description': blog.reviewer_description,
                    'created_at': blog.created_at.isoformat() if blog.created_at else None,
                    'updated_at': blog.updated_at.isoformat() if blog.updated_at else None,
                    'footer_address': blog.footer_address,
                    'meta_title': blog.meta_title,
                    'meta_description': blog.meta_description,
                    'meta_keywords': blog.meta_keywords,
                    'related_blogs': related_blogs,
                    'source': 'blog',
                }
            })
        except Blog.DoesNotExist:
            # Try to find in Category inline blogs
            category = Category.objects.get(slug=slug, blog_published=True)
            
            # Get related content from same parent page
            related_blogs = []
            if category.parent_page:
                # 1. Fetch related Blogs
                related_b = Blog.objects.filter(
                    parent_page=category.parent_page, 
                    published=True
                )

                # 2. Fetch related Categories (acting as blogs)
                related_c = Category.objects.filter(
                    parent_page=category.parent_page,
                    blog_published=True
                ).exclude(id=category.id)

                # Combine and take first 3
                combined = list(related_b) + list(related_c)
                for item in combined[:3]:
                    if isinstance(item, Blog):
                        related_blogs.append({
                            'id': item.id,
                            'title': item.title,
                            'slug': item.slug,
                            'summary': item.summary,
                            'hero_image': get_absolute_url(item.hero_image.url) if item.hero_image else None,
                            'category': item.category.name if item.category else None,
                            'created_at': item.created_at.isoformat() if item.created_at else None,
                        })
                    elif isinstance(item, Category):
                        related_blogs.append({
                            'id': f'cat-{item.id}',
                            'title': item.blog_title or item.name,
                            'slug': item.slug,
                            'summary': item.blog_summary or '',
                            'hero_image': None,
                            'category': item.name,
                            'created_at': None,
                        })
            
            return JsonResponse({
                'blog': {
                    'id': f'cat-{category.id}',
                    'title': category.blog_title or category.name,
                    'slug': category.slug,
                    'summary': category.blog_summary or '',
                    'content': category.blog_content or '',
                    'content_html': category.blog_content or '',
                    'hero_image': None,
                    'category': category.name,
                    'category_slug': category.slug,
                    'parent_page': category.parent_page.slug if category.parent_page else None,
                    'author': category.blog_author_name,
                    'author_image': get_absolute_url(category.blog_author_image.url) if category.blog_author_image else None,
                    'author_description': category.blog_author_description,
                    'reviewer': category.blog_reviewer_name,
                    'reviewer_image': get_absolute_url(category.blog_reviewer_image.url) if category.blog_reviewer_image else None,
                    'reviewer_description': category.blog_reviewer_description,
                    'created_at': None,
                    'updated_at': None,
                    'footer_address': '',
                    'meta_title': category.meta_title,
                    'meta_description': category.meta_description,
                    'meta_keywords': category.meta_keywords,
                    'related_blogs': related_blogs,
                    'source': 'category',
                }
            })
    except (Blog.DoesNotExist, Category.DoesNotExist):
        return JsonResponse({'error': 'Blog not found'}, status=404)

@csrf_exempt
@never_cache
def contact_submit(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Method not allowed'}, status=405)
    
    try:
        data = json.loads(request.body)
        name = data.get('name', '')
        email = data.get('email', '')
        subject = data.get('subject', '')
        message = data.get('message', '')
        
        if not all([name, email, message]):
            return JsonResponse({'error': 'Missing required fields'}, status=400)
        
        # Save to database
        ContactMessage.objects.create(
            name=name,
            email=email,
            subject=subject,
            message=message
        )
        
        return JsonResponse({'success': True, 'message': 'Message sent successfully'})
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@never_cache
def quotes(request):
    try:
        from .models import InsuranceCompany
        
        raw_zip = request.GET.get('zip', '')
        zip_code = ''.join(ch for ch in str(raw_zip) if ch.isdigit())[:5]
        
        companies_qs = InsuranceCompany.objects.filter(published=True).order_by('-rating', 'name')
        
        filtered_companies = []
        if len(zip_code) == 5:
            for company in companies_qs:
                try:
                    covs = list(getattr(company, 'coverages').all())
                except Exception:
                    covs = []
                matches = False
                for cov in covs:
                    try:
                        if cov.matches_zip(zip_code):
                            matches = True
                            break
                    except Exception:
                        continue
                if matches:
                    filtered_companies.append(company)
        else:
            filtered_companies = list(companies_qs)
        
        companies_data = []
        for company in filtered_companies:
            logo_url = None
            if company.logo:
                try:
                    logo_url = request.build_absolute_uri(company.logo.url)
                except Exception:
                    pass

            companies_data.append({
                'id': company.id,
                'name': company.name,
                'slug': company.slug,
                'logo': logo_url,
                'headline': company.headline,
                'features': company.features,
                'cta_text': company.cta_text,
                'short_description': company.short_description,
                'rating': float(company.rating) if company.rating else None,
                'domain_url': company.domain_url,
                'landing_url': company.landing_url,
                'short_url': company.short_url,
                'contact_url': company.contact_url,
            })
        
        return JsonResponse({
            'ok': True,
            'companies': companies_data,
            'zip': zip_code,
            'count': len(companies_data),
        })
    except Exception:
        return JsonResponse({
            'ok': True,
            'companies': [],
            'zip': request.GET.get('zip', ''),
            'count': 0,
            'message': 'Insurance companies feature not yet configured',
        })

@never_cache
def main_page_detail(request, slug):
    try:
        page = MainPage.objects.get(slug=slug)
        return JsonResponse({
            'page': {
                'id': page.id,
                'name': page.name,
                'slug': page.slug,
                'meta_title': page.meta_title,
                'meta_description': page.meta_description,
                'meta_keywords': page.meta_keywords,
                # Add other fields if MainPage has content in the future
            }
        })
    except MainPage.DoesNotExist:
        return JsonResponse({'error': 'Main Page not found'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@never_cache
def team_member_detail(request, slug):
    try:
        member = TeamMember.objects.get(slug=slug, published=True)
        
        def get_absolute_url(relative_url):
            if not relative_url:
                return None
            if relative_url.startswith('http'):
                return relative_url
            return request.build_absolute_uri(relative_url)

        return JsonResponse({
            'team_member': {
                'id': member.id,
                'name': member.name,
                'slug': member.slug,
                'role': member.role,
                'department': member.department,
                'image': get_absolute_url(member.image.url) if member.image else None,
                'linkedin_url': member.linkedin_url,
                'description': member.description,
                'page_slug': member.page.slug if member.page else None,
                'page_title': member.page.title if member.page else None,
                'meta_title': member.meta_title,
                'meta_description': member.meta_description,
                'meta_keywords': member.meta_keywords,
                'twitter_url': member.twitter_url,
                'facebook_url': member.facebook_url,
                'email': member.email,
            }
        })
    except TeamMember.DoesNotExist:
        return JsonResponse({'error': 'Team member not found'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@never_cache
def page_detail(request, slug):
    try:
        page = Page.objects.get(slug=slug, published=True)
        
        def get_absolute_url(relative_url):
            if not relative_url:
                return None
            if relative_url.startswith('http'):
                return relative_url
            return request.build_absolute_uri(relative_url)

        team_members = []
        for member in page.team_members.filter(published=True).order_by('order'):
            team_members.append({
                'id': member.id,
                'name': member.name,
                'slug': member.slug,
                'role': member.role,
                'department': member.department,
                'image': get_absolute_url(member.image.url) if member.image else None,
                'linkedin_url': member.linkedin_url,
                'twitter_url': member.twitter_url,
                'facebook_url': member.facebook_url,
                'email': member.email,
                'description': member.description,
            })
        
        press_items = []
        for item in page.press_items.filter(published=True).order_by('order', '-date'):
            press_items.append({
                'id': item.id,
                'title': item.title,
                'link': item.link,
                'logo': get_absolute_url(item.logo.url) if item.logo else None,
                'date': item.date,
            })
        
        sections_data = []
        for section in page.sections.all().order_by('order'):
            sections_data.append({
                'id': section.id,
                'title': section.title,
                'subtitle': section.subtitle,
                'anchor_id': section.anchor_id,
                'order': section.order,
                'collapsible': section.collapsible,
                'background_color': section.background_color,
                'text_color': section.text_color,
                'type': section.type,
                'layout': section.layout,
                'columns_count': section.columns_count,
                'body': section.body,
                'col1_title': section.col1_title,
                'col1_subtitle': section.col1_subtitle,
                'col1_rich': section.col1_rich,
                'col2_title': section.col2_title,
                'col2_subtitle': section.col2_subtitle,
                'col2_rich': section.col2_rich,
                'col3_title': section.col3_title,
                'col3_subtitle': section.col3_subtitle,
                'col3_rich': section.col3_rich,
                'col4_title': section.col4_title,
                'col4_subtitle': section.col4_subtitle,
                'col4_rich': section.col4_rich,
                'col5_title': section.col5_title,
                'col5_subtitle': section.col5_subtitle,
                'col5_rich': section.col5_rich,
                'image': get_absolute_url(section.image.url) if section.image else None,
                'video_url': section.video_url,
            })

        return JsonResponse({
            'meta': {
                'id': page.id,
                'title': page.title,
                'slug': page.slug,
                'content': page.content,
                'content_bottom': page.content_bottom,
                'hero_image': get_absolute_url(page.hero_image.url) if page.hero_image else None,
                'meta_title': page.meta_title,
                'meta_description': page.meta_description,
                'page_type': page.page_type,
            },
            'sections': sections_data,
            'team_members': team_members,
            'press_items': press_items
        })
    except Page.DoesNotExist:
        return JsonResponse({'error': 'Page not found'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@never_cache
def demo_page(request):
    """Demo page to showcase the blue footer form design"""
    html_content = render_to_string('demo.html', {'title': 'Blue Footer Form Demo'})
    return HttpResponse(html_content)
