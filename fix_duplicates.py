#!/usr/bin/env python
"""
Script to fix duplicate categories causing the MultipleObjectsReturned error
"""
import os
import sys
import django

# Add the backend directory to Python path and setup Django
sys.path.insert(0, 'backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from content.models import Category, Blog

def fix_duplicate_categories():
    print("Fixing duplicate categories...")
    
    # Find all duplicate slugs
    from django.db.models import Count
    
    duplicates = Category.objects.values('slug').annotate(count=Count('id')).filter(count__gt=1)
    
    print(f"Found {duplicates.count()} duplicate slugs:")
    
    for dup in duplicates:
        slug = dup['slug']
        categories = Category.objects.filter(slug=slug).order_by('id')
        
        print(f"\nSlug '{slug}' appears {categories.count()} times:")
        
        for i, cat in enumerate(categories):
            parent = cat.parent_page.slug if cat.parent_page else 'None'
            print(f"  {i+1}. ID: {cat.id}, Name: {cat.name}, Parent: {parent}")
        
        # Keep the first one, remove the rest
        to_keep = categories.first()
        to_delete = list(categories[1:])
        
        print(f"  Keeping ID {to_keep.id}, deleting IDs: {[c.id for c in to_delete]}")
        
        # Before deleting, check if any blogs reference the deleted categories
        for cat_to_delete in to_delete:
            blogs = Blog.objects.filter(category=cat_to_delete)
            if blogs.exists():
                print(f"    Redirecting {blogs.count()} blogs from category ID {cat_to_delete.id} to ID {to_keep.id}")
                blogs.update(category=to_keep)
        
        # Delete the duplicate categories
        Category.objects.filter(id__in=[c.id for c in to_delete]).delete()
        print(f"  Deleted {len(to_delete)} duplicate categories")

if __name__ == "__main__":
    fix_duplicate_categories()
    print("\nDone!")