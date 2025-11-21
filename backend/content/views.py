from django.http import JsonResponse
from django.views.decorators.cache import never_cache
from django.db.models import Q
from django.core.paginator import Paginator
from django.utils.text import slugify
from django.core.exceptions import ValidationError
from .models import Blog, SiteConfig, HomePage, HomePageSection, MainPage, Category, Page, PageSection
import json

# Footer address function - returns the first article with an address
def get_footer_address(request):
    """Get footer address from articles - returns the first article with an address"""
    try:
        # Get the most recent article with a footer address
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
        
        # Fallback to site config address
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

# Homepage API
@never_cache
def homepage(request):
    try:
        # Get homepage configuration
        homepage_config = HomePage.objects.first()
        if not homepage_config:
            return JsonResponse({'sections': []})
        
        # Build absolute URL for media files
        def get_absolute_url(relative_url):
            if not relative_url:
                return None
            if relative_url.startswith('http'):
                return relative_url
            return request.build_absolute_uri(relative_url)
        
        # Get homepage sections
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
            elif section.type == 'video':
                section_data['video_url'] = section.video_url
            elif section.type == 'media':
                section_data['image'] = get_absolute_url(section.image.url) if section.image else None
            
            sections.append(section_data)
        
        # Get video placements (videos below hero image)
        from .models import VideoPlacement
        videos = []
        for video in VideoPlacement.objects.filter(homepage=homepage_config, published=True).order_by('-created_at'):
            video_url = None
            video_type = 'embed'
            
            if video.video_file:
                video_url = get_absolute_url(video.video_file.url)
                video_type = 'file'
            elif video.video_url:
                # Convert to embed URL if it's YouTube/Vimeo
                raw_url = video.video_url.strip()
                if 'youtube.com/watch' in raw_url or 'youtu.be/' in raw_url:
                    # Extract video ID and convert to embed URL
                    import re
                    match = re.search(r'(?:v=|youtu\.be/)([a-zA-Z0-9_-]{11})', raw_url)
                    if match:
                        video_url = f"https://www.youtube.com/embed/{match.group(1)}"
                elif 'vimeo.com/' in raw_url:
                    # Extract Vimeo ID
                    import re
                    match = re.search(r'vimeo\.com/(\d+)', raw_url)
                    if match:
                        video_url = f"https://player.vimeo.com/video/{match.group(1)}"
                else:
                    video_url = raw_url
                video_type = 'embed'
            
            if video_url:
                videos.append({
                    'type': 'video',
                    'title': video.title or '',
                    'video_url': video_url,
                    'video_type': video_type,
                })
        
        return JsonResponse({
            'sections': sections,
            'videos': videos,  # Videos to display below hero image
            'meta_title': homepage_config.meta_title,
            'meta_description': homepage_config.meta_description,
            'hero_image': get_absolute_url(homepage_config.hero_image.url) if homepage_config.hero_image else None,
            'content': homepage_config.content,
            'home_cta_text': homepage_config.home_cta_text,
            'home_cta_url': homepage_config.home_cta_url,
            'home_anchor_id': homepage_config.home_anchor_id,
        })
    except Exception as e:
        return JsonResponse({'error': str(e), 'sections': []}, status=500)

# Site config API
@never_cache  
def site_config(request):
    try:
        config = SiteConfig.objects.first()
        if not config:
            return JsonResponse({'brand_name': 'AutoInsurance.org'})
        
        return JsonResponse({
            'brand_name': config.brand_name,
            'site_name': config.brand_name,
            'email': config.email,
            'phone_number': config.phone_number,
            'disclaimer': config.disclaimer,
            'footer_disclaimer': config.disclaimer,
            'copyright_text': config.copyright_text,
            'footer_about_text': config.footer_about_text,
            'company_address': config.company_address,
            'logo_url': config.logo.url if config.logo else None,
            'logo_icon_url': config.logo_icon.url if config.logo_icon else None,
            'favicon_url': config.favicon.url if config.favicon else None,
            'logo_height': config.logo_height_px,
            'social_links': config.social_links,
            'social_links_text': config.social_links_text,
            'facebook_url': config.facebook_url,
            'twitter_url': config.twitter_url,
            'instagram_url': config.instagram_url,
            'youtube_url': config.youtube_url,
            'linkedin_url': config.linkedin_url,
            'accent_orange_hex': config.accent_orange_hex,
            'accent_orange_hover_hex': config.accent_orange_hover_hex,
            'accent_gradient_from_hex': config.accent_gradient_from_hex,
            'accent_gradient_to_hex': config.accent_gradient_to_hex,
            'updated_at': config.updated_at.isoformat() if config.updated_at else None,
        })
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

# Main pages API
@never_cache
def main_pages(request):
    try:
        pages = []
        for page in MainPage.objects.filter(show_in_header=True).order_by('order'):
            pages.append({
                'id': page.id,
                'name': page.name,
                'slug': page.slug,
                'order': page.order,
                'has_dropdown': page.has_dropdown,
            })
        return JsonResponse({'pages': pages})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

# Menu footer API
@never_cache
def menu_footer(request):
    try:
        company_links = []
        legal_links = []
        
        for page in Page.objects.filter(show_in_footer=True, published=True).order_by('footer_order'):
            link_data = {
                'name': page.title,
                'page_slug': page.slug,
                'anchor_id': None,
            }
            
            if page.page_type == 'company':
                company_links.append(link_data)
            elif page.page_type == 'legal':
                legal_links.append(link_data)
        
        return JsonResponse({
            'company': company_links,
            'legal': legal_links,
        })
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

# Categories API for specific page
@never_cache
def categories_for_page(request):
    page_slug = request.GET.get('page')
    if not page_slug:
        return JsonResponse({'categories': []})
    
    try:
        page = MainPage.objects.get(slug=page_slug)
        categories = []
        for category in Category.objects.filter(parent_page=page):
            categories.append({
                'id': category.id,
                'name': category.name,
                'slug': category.slug,
            })
        return JsonResponse({'categories': categories})
    except MainPage.DoesNotExist:
        return JsonResponse({'categories': []})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

# All categories API
@never_cache
def categories_api(request):
    try:
        categories = []
        for category in Category.objects.all():
            categories.append({
                'id': category.id,
                'name': category.name,
                'slug': category.slug,
                'parent_page': category.parent_page.slug if category.parent_page else None,
            })
        return JsonResponse({'categories': categories})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

# Blogs list API
@never_cache
def blogs_list(request):
    try:
        # Get query parameters
        page = int(request.GET.get('page', 1))
        page_size = int(request.GET.get('page_size', 10))
        search = request.GET.get('search', '')
        category_slug = request.GET.get('category', '')
        
        # Build absolute URL for media files
        def get_absolute_url(relative_url):
            if not relative_url:
                return None
            if relative_url.startswith('http'):
                return relative_url
            # Build absolute URL using request
            return request.build_absolute_uri(relative_url)
        
        # Collect all blogs from both Blog model and Category inline blogs
        all_blogs = []
        
        # 1. Get standalone Blog objects
        blog_query = Q(published=True)
        if search:
            blog_query &= Q(title__icontains=search) | Q(summary__icontains=search)
        if category_slug:
            blog_query &= Q(category__slug=category_slug)
        
        for blog in Blog.objects.filter(blog_query).order_by('-created_at'):
            all_blogs.append({
                'id': f'blog-{blog.id}',
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
                'source': 'blog',
            })
        
        # 2. Get Category inline blogs
        cat_query = Q(blog_published=True, blog_title__isnull=False)
        if search:
            cat_query &= Q(blog_title__icontains=search) | Q(blog_summary__icontains=search)
        if category_slug:
            cat_query &= Q(slug=category_slug)
        
        for cat in Category.objects.filter(cat_query).select_related('parent_page'):
            all_blogs.append({
                'id': f'cat-{cat.id}',
                'title': cat.blog_title or cat.name,
                'slug': cat.slug,
                'summary': cat.blog_summary or '',
                'content': cat.blog_content or '',
                'content_html': cat.blog_content or '',
                'hero_image': None,
                'category': cat.name,
                'category_slug': cat.slug,
                'parent_page': cat.parent_page.slug if cat.parent_page else None,
                'author': cat.blog_author_name,
                'author_image': get_absolute_url(cat.blog_author_image.url) if cat.blog_author_image else None,
                'author_description': cat.blog_author_description,
                'reviewer': cat.blog_reviewer_name,
                'reviewer_image': get_absolute_url(cat.blog_reviewer_image.url) if cat.blog_reviewer_image else None,
                'reviewer_description': cat.blog_reviewer_description,
                'created_at': None,
                'updated_at': None,
                'source': 'category',
            })
        
        # Paginate the combined list
        from django.core.paginator import Paginator
        paginator = Paginator(all_blogs, page_size)
        page_obj = paginator.get_page(page)
        
        return JsonResponse({
            'blogs': list(page_obj),
            'pagination': {
                'total_count': paginator.count,
                'page_size': page_size,
                'current_page': page,
                'total_pages': paginator.num_pages,
                'has_next': page_obj.has_next(),
                'has_previous': page_obj.has_previous(),
            }
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
            
            # Get related blogs from same category
            related_blogs = []
            if blog.category:
                related = Blog.objects.filter(
                    category=blog.category, 
                    published=True
                ).exclude(id=blog.id)[:3]
                for r in related:
                    related_blogs.append({
                        'id': r.id,
                        'title': r.title,
                        'slug': r.slug,
                        'summary': r.summary,
                        'hero_image': get_absolute_url(r.hero_image.url) if r.hero_image else None,
                        'category': r.category.name if r.category else None,
                        'created_at': r.created_at.isoformat() if r.created_at else None,
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
                    'related_blogs': related_blogs,
                    'source': 'blog',
                }
            })
        except Blog.DoesNotExist:
            # Try to find in Category inline blogs
            category = Category.objects.get(slug=slug, blog_published=True)
            
            # Get related categories from same parent page
            related_blogs = []
            if category.parent_page:
                related = Category.objects.filter(
                    parent_page=category.parent_page,
                    blog_published=True
                ).exclude(id=category.id)[:3]
                for r in related:
                    related_blogs.append({
                        'id': f'cat-{r.id}',
                        'title': r.blog_title or r.name,
                        'slug': r.slug,
                        'summary': r.blog_summary or '',
                        'hero_image': None,
                        'category': r.name,
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
                    'related_blogs': related_blogs,
                    'source': 'category',
                }
            })
    except (Blog.DoesNotExist, Category.DoesNotExist):
        return JsonResponse({'error': 'Blog not found'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

# Pages with categories API
@never_cache
def pages_with_categories(request):
    try:
        include_blogs = request.GET.get('include_blogs', '1') == '1'
        pages_data = []
        
        for page in MainPage.objects.all():
            page_data = {
                'id': page.id,
                'name': page.name,
                'slug': page.slug,
                'order': page.order,
                'categories': []
            }
            
            # Get categories for this page
            for category in Category.objects.filter(parent_page=page):
                category_data = {
                    'id': category.id,
                    'name': category.name,
                    'slug': category.slug,
                    'blogs': []
                }
                
                # Optionally include blogs for this category
                if include_blogs:
                    for blog in Blog.objects.filter(category=category, published=True)[:5]:
                        category_data['blogs'].append({
                            'id': blog.id,
                            'title': blog.title,
                            'slug': blog.slug,
                            'summary': blog.summary,
                        })
                
                page_data['categories'].append(category_data)
            
            pages_data.append(page_data)
        
        return JsonResponse({'pages': pages_data})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

# Contact submit API
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
        
        # Here you would save to database or send email
        return JsonResponse({'success': True, 'message': 'Message sent successfully'})
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

# Quotes API
@never_cache
def quotes(request):
    """Return insurance company quotes based on ZIP code"""
    try:
        from .models import InsuranceCompany
        
        zip_code = request.GET.get('zip', '')
        
        # Get all published insurance companies
        companies = InsuranceCompany.objects.filter(published=True).order_by('-rating', 'name')
        
        companies_data = []
        for company in companies:
            companies_data.append({
                'id': company.id,
                'name': company.name,
                'slug': company.slug,
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
    except Exception as e:
        # Return empty list if InsuranceCompany model doesn't exist or other error
        return JsonResponse({
            'ok': True,
            'companies': [],
            'zip': request.GET.get('zip', ''),
            'count': 0,
            'message': 'Insurance companies feature not yet configured',
        })

# Page detail API
@never_cache
def page_detail(request, slug):
    try:
        page = Page.objects.get(slug=slug, published=True)
        return JsonResponse({
            'page': {
                'id': page.id,
                'title': page.title,
                'slug': page.slug,
                'content': page.content,
                'hero_image': page.hero_image.url if page.hero_image else None,
                'meta_title': page.meta_title,
                'meta_description': page.meta_description,
            }
        })
    except Page.DoesNotExist:
        return JsonResponse({'error': 'Page not found'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
