#!/usr/bin/env python
"""
Script to check database content and fix the article detail page
"""
import os
import sys
import django

# Add the backend directory to Python path and setup Django
sys.path.insert(0, 'backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from content.models import Category, Blog

def check_database():
    print("=== CATEGORIES ===")
    
    # Check Alaska specifically
    try:
        category = Category.objects.get(slug='alaska')
        print(f"Found Alaska category: {category.name}")
        print(f"  Has blog_title: {bool(category.blog_title)}")
        print(f"  Blog_title: {category.blog_title}")
        print(f"  Has blog_content: {bool(category.blog_content)}")
        print(f"  Blog published: {getattr(category, 'blog_published', False)}")
        print(f"  Parent page: {category.parent_page.slug if category.parent_page else None}")
    except Category.DoesNotExist:
        print("No Alaska category found")
    
    print("\nAll categories:")
    categories = Category.objects.all()[:10]
    for c in categories:
        parent = c.parent_page.slug if c.parent_page else 'None'
        has_blog = bool(c.blog_title) or bool(c.blog_content)
        print(f"  {c.name} (slug: {c.slug}) - Parent: {parent} - Has Blog: {has_blog}")
    
    print("\n=== BLOGS ===")
    blogs = Blog.objects.filter(published=True)[:5]
    for b in blogs:
        parent = b.parent_page.slug if b.parent_page else 'None'
        category = b.category.slug if b.category else 'None'
        print(f"  {b.title} (slug: {b.slug}) - Parent: {parent} - Category: {category}")

if __name__ == "__main__":
    check_database()