#!/usr/bin/env python
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from content.models import MainPage, Category, Blog

print("=== DATABASE CONTENT ===")
print(f"MainPage count: {MainPage.objects.count()}")
print(f"Category count: {Category.objects.count()}")
print(f"Blog count: {Blog.objects.count()}")

print("\n=== MAIN PAGES ===")
for mp in MainPage.objects.all():
    print(f"- {mp.name} (slug: {mp.slug})")

print("\n=== CATEGORIES ===")
for cat in Category.objects.all():
    print(f"- {cat.name} (slug: {cat.slug}) - Parent: {cat.parent_page.name if cat.parent_page else 'None'}")

print("\n=== SEARCH FOR ALASKA ===")
alaska_matches = Category.objects.filter(name__icontains='alaska')
print(f"Categories with 'alaska' in name: {alaska_matches.count()}")
for cat in alaska_matches:
    print(f"  - {cat.name} (slug: {cat.slug}) - Parent: {cat.parent_page.name}")

print("\n=== STATE CATEGORIES ===")
state_page = MainPage.objects.filter(slug='state').first()
if state_page:
    state_cats = Category.objects.filter(parent_page=state_page)
    print(f"State categories: {state_cats.count()}")
    for cat in state_cats:
        print(f"  - {cat.name} (slug: {cat.slug})")
else:
    print("No 'state' main page found")