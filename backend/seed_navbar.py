import os
import django
import sys

# Setup Django environment
sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from content.models import MainPage

def seed_navbar():
    print("Seeding/Updating MainPage entries...")
    
    # Define standard pages
    # We want these specific slugs to match Navbar.jsx logic
    pages = [
        {'name': 'Companies', 'slug': 'companies', 'order': 0, 'has_dropdown': True, 'show_in_header': True},
        {'name': 'States', 'slug': 'state', 'order': 1, 'has_dropdown': True, 'show_in_header': True},
        {'name': 'Vehicles', 'slug': 'vehicle', 'order': 2, 'has_dropdown': True, 'show_in_header': True},
        {'name': 'Shopping', 'slug': 'shopping', 'order': 3, 'has_dropdown': True, 'show_in_header': True},
        {'name': 'Resources', 'slug': 'resources', 'order': 4, 'has_dropdown': True, 'show_in_header': True},
        {'name': 'About Us', 'slug': 'about-us', 'order': 5, 'has_dropdown': False, 'show_in_header': False},
    ]

    for p_data in pages:
        target_slug = p_data['slug']
        target_name = p_data['name']
        
        # Try to find by slug first
        page = MainPage.objects.filter(slug=target_slug).first()
        
        if not page:
            # Try to find by name
            page = MainPage.objects.filter(name=target_name).first()
            
            if page:
                print(f"Found page by name '{target_name}' (old slug: {page.slug}). Updating slug to '{target_slug}'...")
                page.slug = target_slug
            else:
                print(f"Creating new page '{target_name}' with slug '{target_slug}'...")
                page = MainPage(name=target_name, slug=target_slug)
        
        # Update fields
        page.name = target_name # Ensure name matches
        page.order = p_data['order']
        page.has_dropdown = p_data['has_dropdown']
        page.show_in_header = p_data['show_in_header']
        
        try:
            page.save()
            print(f"Saved: {page.name} ({page.slug})")
        except Exception as e:
            print(f"Error saving {target_name}: {e}")

    print("Navbar seeding complete.")

if __name__ == '__main__':
    seed_navbar()
