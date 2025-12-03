#!/usr/bin/env python
import os
import sys
import django

# Setup Django
sys.path.append('backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from content.models import Category
from django.core.files import File
from django.core.files.base import ContentFile
from PIL import Image
import io

def add_sample_reviewer_data():
    """Add sample reviewer information to categories"""
    
    # Get some categories to add reviewer data
    categories = Category.objects.all()[:5]
    
    sample_reviewers = [
        {
            'name': 'Sarah Johnson',
            'description': 'Insurance expert with 15+ years of experience'
        },
        {
            'name': 'Mike Chen',
            'description': 'Certified insurance professional and industry analyst'
        },
        {
            'name': 'Emily Rodriguez',
            'description': 'Auto insurance specialist and risk assessor'
        },
        {
            'name': 'David Thompson',
            'description': 'Insurance industry veteran and compliance expert'
        },
        {
            'name': 'Lisa Wang',
            'description': 'Insurance consultant with expertise in state regulations'
        }
    ]
    
    for i, category in enumerate(categories):
        reviewer = sample_reviewers[i % len(sample_reviewers)]
        
        # Add reviewer information to category
        category.blog_reviewer_name = reviewer['name']
        category.blog_reviewer_description = reviewer['description']
        
        # Create a simple colored square image as reviewer image
        img = Image.new('RGB', (100, 100), color=(255, 165, 0))  # Orange color
        img_io = io.BytesIO()
        img.save(img_io, format='JPEG')
        img_io.seek(0)
        
        category.blog_reviewer_image.save(
            f"{category.slug}_reviewer.jpg",
            File(img_io),
            save=True
        )
        
        print(f"Added reviewer '{reviewer['name']}' to category '{category.name}'")
    
    print(f"Added reviewer information to {len(categories)} categories")

if __name__ == '__main__':
    add_sample_reviewer_data()