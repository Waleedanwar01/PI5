#!/usr/bin/env python
import os
import sys
import django

# Add the backend directory to Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from content.models import MainPage, Category, Blog

def add_alaska():
    try:
        # Find the state main page
        state_page = MainPage.objects.filter(slug='state').first()
        if not state_page:
            print("State page not found!")
            return False
            
        print(f"Found state page: {state_page.name}")
        
        # Check if Alaska already exists
        alaska = Category.objects.filter(slug='alaska', parent_page=state_page).first()
        if alaska:
            print("Alaska already exists with ID:", alaska.id)
            return True
            
        # Create Alaska category
        alaska = Category.objects.create(
            name="Alaska",
            slug="alaska", 
            parent_page=state_page,
            blog_published=True,
            blog_title="Complete Guide to Alaska",
            blog_summary="Everything you need to know about Alaska and insurance coverage."
        )
        print(f"Created Alaska category with ID: {alaska.id}")
        
        # Also create a blog for Alaska
        blog = Blog.objects.create(
            title="Complete Guide to Alaska",
            slug="alaska",
            summary="Everything you need to know about Alaska and insurance coverage.",
            content="<h2>Complete Guide to Alaska</h2><p>Alaska is the largest state in the United States by area, covering 663,267 square miles. Despite its vast size, Alaska has a relatively small population, which can affect insurance rates and availability.</p><h3>Auto Insurance in Alaska</h3><p>Alaska requires all drivers to carry liability insurance with minimum coverage of 50/100/25. The state also requires uninsured motorist coverage and personal injury protection.</p><h3>Factors Affecting Rates</h3><p>Factors that can affect your auto insurance rates in Alaska include:</p><ul><li>Your driving record</li><li>Age and experience</li><li>Vehicle type and safety features</li><li>Location within Alaska</li><li>Annual mileage</li></ul><p>Contact us to get the best auto insurance rates in Alaska!</p>",
            parent_page=state_page,
            category=alaska,
            published=True
        )
        print(f"Created Alaska blog with ID: {blog.id}")
        print("Alaska has been successfully added!")
        return True
        
    except Exception as e:
        print(f"Error: {e}")
        return False

if __name__ == "__main__":
    add_alaska()