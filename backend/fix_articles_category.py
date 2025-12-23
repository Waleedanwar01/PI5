
import os
import django
import random

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from content.models import Blog, Category

# Get or create a category to assign
cat_name = "Auto Insurance Guides"
category, created = Category.objects.get_or_create(
    slug="auto-insurance-guides",
    defaults={'name': cat_name, 'parent_page_id': 1} # Assuming parent_page 1 exists, otherwise fetch first
)

if created:
    print(f"Created category: {category.name}")
else:
    print(f"Using category: {category.name}")

# Assign existing blogs to this category if they have None
blogs = Blog.objects.filter(category__isnull=True)
for blog in blogs:
    blog.category = category
    blog.save()
    print(f"Assigned '{blog.title}' to '{category.name}'")

# Create a few more articles to demonstrate "All articles"
titles = [
    "Understanding Liability Coverage",
    "Comprehensive vs Collision",
    "How to Lower Your Premiums",
    "Teen Driver Insurance Tips",
    "Best Insurance for Seniors",
    "Gap Insurance Explained",
    "No-Fault Insurance States",
    "SR-22 Insurance Requirements",
    "Classic Car Insurance Guide",
    "Rideshare Insurance Basics"
]

for title in titles:
    slug = title.lower().replace(" ", "-")
    if not Blog.objects.filter(slug=slug).exists():
        Blog.objects.create(
            title=title,
            slug=slug,
            category=category,
            summary=f"This is a summary for {title}. Learn more about auto insurance.",
            content=f"<p>Full content for {title} goes here.</p>",
            published=True,
            author_name="Insurance Expert"
        )
        print(f"Created blog: {title}")

print(f"Total blogs in '{category.name}': {Blog.objects.filter(category=category).count()}")
