#!/usr/bin/env python
import os
import sys
import django

# Setup Django
sys.path.append('backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from content.models import MainPage, Category, SiteConfig
from django.core.files import File
from django.core.files.base import ContentFile
from PIL import Image
import io

def create_main_pages():
    """Create main pages"""
    pages = [
        {'name': 'States', 'slug': 'state', 'order': 1},
        {'name': 'Companies', 'slug': 'companies', 'order': 2},
        {'name': 'Vehicles', 'slug': 'vehicles', 'order': 3},
        {'name': 'Shopping', 'slug': 'shopping', 'order': 4},
        {'name': 'Resources', 'slug': 'resources', 'order': 5},
    ]
    
    for page_data in pages:
        page, created = MainPage.objects.get_or_create(
            slug=page_data['slug'],
            defaults=page_data
        )
        if created:
            print(f"Created MainPage: {page.name}")
        else:
            print(f"MainPage already exists: {page.name}")

def create_categories():
    """Create categories for each main page"""
    # State categories
    state_categories = [
        {'name': 'Alabama', 'slug': 'alabama', 'parent_page_slug': 'state'},
        {'name': 'Alaska', 'slug': 'alaska', 'parent_page_slug': 'state'},
        {'name': 'Arizona', 'slug': 'arizona', 'parent_page_slug': 'state'},
        {'name': 'California', 'slug': 'california', 'parent_page_slug': 'state'},
        {'name': 'Florida', 'slug': 'florida', 'parent_page_slug': 'state'},
        {'name': 'Texas', 'slug': 'texas', 'parent_page_slug': 'state'},
        {'name': 'New York', 'slug': 'new-york', 'parent_page_slug': 'state'},
    ]
    
    # Company categories
    company_categories = [
        {'name': 'Allstate', 'slug': 'allstate', 'parent_page_slug': 'companies'},
        {'name': 'Progressive', 'slug': 'progressive', 'parent_page_slug': 'companies'},
        {'name': 'State Farm', 'slug': 'state-farm', 'parent_page_slug': 'companies'},
        {'name': 'GEICO', 'slug': 'geico', 'parent_page_slug': 'companies'},
        {'name': 'Liberty Mutual', 'slug': 'liberty-mutual', 'parent_page_slug': 'companies'},
        {'name': 'Farmers', 'slug': 'farmers', 'parent_page_slug': 'companies'},
        {'name': 'USAA', 'slug': 'usaa', 'parent_page_slug': 'companies'},
    ]
    
    # Vehicle categories
    vehicle_categories = [
        {'name': 'Car Insurance', 'slug': 'car-insurance', 'parent_page_slug': 'vehicles'},
        {'name': 'Motorcycle Insurance', 'slug': 'motorcycle-insurance', 'parent_page_slug': 'vehicles'},
        {'name': 'Commercial Vehicle', 'slug': 'commercial-vehicle', 'parent_page_slug': 'vehicles'},
        {'name': 'Classic Car', 'slug': 'classic-car', 'parent_page_slug': 'vehicles'},
        {'name': 'Luxury Car', 'slug': 'luxury-car', 'parent_page_slug': 'vehicles'},
    ]
    
    all_categories = state_categories + company_categories + vehicle_categories
    
    for cat_data in all_categories:
        try:
            parent_page = MainPage.objects.get(slug=cat_data['parent_page_slug'])
            category, created = Category.objects.get_or_create(
                slug=cat_data['slug'],
                defaults={
                    'name': cat_data['name'],
                    'parent_page': parent_page,
                }
            )
            if created:
                print(f"Created Category: {category.name}")
            else:
                print(f"Category already exists: {category.name}")
        except MainPage.DoesNotExist:
            print(f"Parent page not found: {cat_data['parent_page_slug']}")

def create_site_config():
    """Create/update site configuration"""
    config, created = SiteConfig.objects.get_or_create(
        defaults={
            'brand_name': 'Auto Insurance Guide',
            'tagline': 'Find the Best Auto Insurance Deals',
            'hero_title': 'Find Your Perfect Auto Insurance Coverage',
            'copyright_text': '© 2024 Auto Insurance Guide. All rights reserved.',
            'accent_orange_hex': '#ea580c',
            'accent_orange_hover_hex': '#c2410c',
            'footer_about_text': 'Your trusted guide for auto insurance information and comparisons.',
            'company_address': '123 Insurance Street, City, State 12345',
            'meta_title': 'Auto Insurance Guide - Find the Best Coverage',
            'meta_description': 'Compare auto insurance rates and find the best coverage for your needs.',
            'meta_keywords': 'auto insurance, car insurance, insurance quotes, compare insurance',
            'homepage_meta_keywords': 'auto insurance, car insurance quotes, insurance comparison',
        }
    )
    if created:
        print("Created SiteConfig")
    else:
        print("SiteConfig already exists")

def main():
    print("Starting database seeding...")
    create_main_pages()
    create_categories()
    create_site_config()
    print("Database seeding completed!")

if __name__ == '__main__':
    main()