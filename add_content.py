#!/usr/bin/env python
"""
Script to add blog content to the Alaska category for testing
"""
import os
import sys
import django

# Add the backend directory to Python path and setup Django
sys.path.insert(0, 'backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from content.models import Category

def add_alaska_content():
    try:
        # Find Alaska category
        alaska = Category.objects.get(slug='alaska')
        print(f"Found Alaska category: {alaska.name}")
        
        # Add blog content
        alaska.blog_title = "Alaska Auto Insurance Guide"
        alaska.blog_summary = "Complete guide to auto insurance requirements, rates, and providers in Alaska."
        alaska.blog_content = """
        <h2>Alaska Auto Insurance Requirements</h2>
        <p>Alaska drivers are required to carry minimum liability insurance coverage. The minimum requirements are:</p>
        <ul>
        <li><strong>$50,000</strong> for bodily injury per person</li>
        <li><strong>$100,000</strong> for bodily injury per accident</li>
        <li><strong>$25,000</strong> for property damage per accident</li>
        </ul>
        
        <h2>Average Auto Insurance Rates in Alaska</h2>
        <p>Alaska auto insurance rates can vary significantly based on several factors including:</p>
        <ul>
        <li>Age and driving experience</li>
        <li>Vehicle type and safety features</li>
        <li>Location within Alaska</li>
        <li>Claims history</li>
        </ul>
        
        <h2>Best Auto Insurance Companies in Alaska</h2>
        <p>Several insurance companies offer competitive rates in Alaska:</p>
        <ul>
        <li><strong>State Farm</strong> - Known for good customer service</li>
        <li><strong>Allstate</strong> - Competitive rates for safe drivers</li>
        <li><strong>Progressive</strong> - Good for tech-savvy customers</li>
        </ul>
        
        <h2>How to Get the Best Rates</h2>
        <p>To get the best auto insurance rates in Alaska:</p>
        <ol>
        <li>Shop around and compare quotes from multiple providers</li>
        <li>Maintain a clean driving record</li>
        <li>Consider increasing your deductible to lower premiums</li>
        <li>Bundle your auto insurance with other policies</li>
        <li>Look for available discounts</li>
        </ol>
        """
        alaska.blog_published = True
        
        # Save the changes
        alaska.save()
        print("SUCCESS: Added blog content to Alaska category!")
        print(f"Title: {alaska.blog_title}")
        print(f"Published: {alaska.blog_published}")
        
    except Category.DoesNotExist:
        print("ERROR: Alaska category not found!")

if __name__ == "__main__":
    add_alaska_content()