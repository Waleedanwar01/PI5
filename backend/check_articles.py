
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from content.models import Blog, Category

print(f"{'Title':<30} | {'Slug':<20} | {'Category':<20} | {'Published':<10}")
print("-" * 90)

for blog in Blog.objects.all():
    cat_name = blog.category.name if blog.category else "None"
    cat_slug = blog.category.slug if blog.category else "None"
    print(f"{blog.title[:28]:<30} | {blog.slug[:18]:<20} | {cat_name[:18]:<20} | {str(blog.published):<10}")

print("\nCategories:")
for cat in Category.objects.all():
    print(f"{cat.name} ({cat.slug}) - Blogs count: {Blog.objects.filter(category=cat).count()}")
