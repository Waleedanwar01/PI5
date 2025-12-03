#!/usr/bin/env python3
"""
Script to add sample author and reviewer information to categories
to demonstrate the enhanced admin interface
"""

import os
import sys
import django

# Add the backend directory to the path
sys.path.append('backend')

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from content.models import Category, MainPage

def add_sample_author_reviewer_data():
    """Add sample author and reviewer data to categories"""
    
    # Sample author data
    authors = [
        {
            "name": "Ahmad Khan",
            "description": "Senior Insurance Expert with 15+ years experience in auto insurance. Specialized in state regulations and vehicle coverage.",
            "image": "blog/authors/ahmad-khan.jpg"
        },
        {
            "name": "Fatima Alvi", 
            "description": "Insurance Analyst focusing on vehicle types and insurance premiums. Expert in comparative analysis.",
            "image": "blog/authors/fatima-alvi.jpg"
        },
        {
            "name": "Omar Hassan",
            "description": "Legal advisor for insurance claims and policy documentation. Helps readers understand fine print.",
            "image": "blog/authors/omar-hassan.jpg"
        },
        {
            "name": "Ayesha Malik",
            "description": "Customer service expert with deep knowledge of insurance companies and their policies.",
            "image": "blog/authors/ayesha-malik.jpg"
        }
    ]
    
    # Sample reviewer data
    reviewers = [
        {
            "name": "Dr. Imran Sheikh",
            "description": "Certified Insurance Professional (CIP) with 20+ years in the industry. Reviews technical accuracy.",
            "image": "blog/reviewers/dr-imran-sheikh.jpg"
        },
        {
            "name": "Sarah Johnson",
            "description": "Insurance Regulatory Expert ensuring all content meets compliance standards.",
            "image": "blog/reviewers/sarah-johnson.jpg"
        },
        {
            "name": "Mohammad Ali",
            "description": "Senior Actuary reviewing mathematical calculations and statistical data.",
            "image": "blog/reviewers/mohammad-ali.jpg"
        }
    ]
    
    # Get all categories
    categories = Category.objects.all()
    
    print(f"Found {categories.count()} categories to update...")
    
    # Assign author and reviewer data to categories
    for i, category in enumerate(categories):
        # Cycle through authors and reviewers
        author = authors[i % len(authors)]
        reviewer = reviewers[i % len(reviewers)]
        
        # Update category with author and reviewer info
        category.blog_author_name = author["name"]
        category.blog_author_description = author["description"]
        # Note: We're not actually uploading images, just setting the field names
        category.blog_author_image = None  # Would be set to actual image file
        
        category.blog_reviewer_name = reviewer["name"] 
        category.blog_reviewer_description = reviewer["description"]
        # Note: We're not actually uploading images, just setting the field names
        category.blog_reviewer_image = None  # Would be set to actual image file
        
        # Also enable blog content for some categories
        if i % 3 == 0:  # Every 3rd category gets blog content
            category.blog_published = True
            category.blog_title = f"Complete Guide to {category.name}"
            category.blog_summary = f"Everything you need to know about {category.name} and insurance coverage."
        
        category.save()
        print(f"[OK] Updated category: {category.name}")
    
    print("\n*** Sample author and reviewer data added successfully! ***")
    print("\nNow you can:")
    print("\n*** Sample author and reviewer data added successfully! ***")
    print("\nNow you can:")
    print("1. Go to Django Admin > Categories")
    print("2. See the new Author and Reviewer columns in the list view")
    print("3. Click on any category to see the new Author Information and Reviewer Information sections")
    print("4. View the author/reviewer names, images, and descriptions")
    print("1. Go to Django Admin → Categories")
    print("2. See the new Author and Reviewer columns in the list view")
    print("3. Click on any category to see the new Author Information and Reviewer Information sections")
    print("4. View the author/reviewer names, images, and descriptions")

if __name__ == "__main__":
    add_sample_author_reviewer_data()