import os
import sys
import django

# Setup Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from content.models import Page, SiteConfig
from django.core.files.base import ContentFile

def seed_pages():
    print("Seeding standard pages...")

    pages_data = [
        {
            "title": "About Us",
            "slug": "about",
            "page_type": "company",
            "show_in_footer": True,
            "content": """
                <h2>About Our Company</h2>
                <p>We are dedicated to providing the best insurance comparison services. Our mission is to help you save money while getting the coverage you need.</p>
                <h3>Our Mission</h3>
                <p>To simplify insurance for everyone.</p>
                <h3>Our Vision</h3>
                <p>A world where everyone is protected.</p>
            """,
            "meta_title": "About Us - Auto Insurance Savings",
            "meta_description": "Learn more about our company and mission."
        },
        {
            "title": "Contact Us",
            "slug": "contact",
            "page_type": "company",
            "show_in_footer": True,
            "content": """
                <h2>Get in Touch</h2>
                <p>Have questions? We are here to help. Fill out the form below or reach out to us via email or phone.</p>
            """,
            "meta_title": "Contact Us - Auto Insurance Savings",
            "meta_description": "Contact our support team for assistance."
        },
        {
            "title": "Glossary",
            "slug": "glossary",
            "page_type": "company",
            "show_in_footer": True,
            "content": """
                <h2>Insurance Glossary</h2>
                <p>Understanding insurance terms can be difficult. Here is a list of common terms:</p>
                <ul>
                    <li><strong>Premium:</strong> The amount you pay for your insurance policy.</li>
                    <li><strong>Deductible:</strong> The amount you pay out of pocket before insurance kicks in.</li>
                    <li><strong>Liability:</strong> Coverage for damages you cause to others.</li>
                    <li><strong>Collision:</strong> Coverage for damages to your car from an accident.</li>
                    <li><strong>Comprehensive:</strong> Coverage for non-collision damages (theft, weather, etc.).</li>
                </ul>
            """,
            "meta_title": "Insurance Glossary - Common Terms",
            "meta_description": "Definitions of common insurance terms."
        },
        {
            "title": "Privacy Policy",
            "slug": "privacy-policy",
            "page_type": "legal",
            "show_in_footer": True,
            "content": """
                <h2>Privacy Policy</h2>
                <p>Your privacy is important to us. This policy explains how we collect, use, and protect your personal information.</p>
                <h3>Information We Collect</h3>
                <p>We collect information you provide directly to us, such as when you request a quote.</p>
                <h3>How We Use Information</h3>
                <p>We use your information to provide quotes and improve our services.</p>
            """,
            "meta_title": "Privacy Policy",
            "meta_description": "Read our privacy policy."
        },
        {
            "title": "Terms & Conditions",
            "slug": "terms-conditions",
            "page_type": "legal",
            "show_in_footer": True,
            "content": """
                <h2>Terms and Conditions</h2>
                <p>Please read these terms carefully before using our website.</p>
                <h3>Acceptance of Terms</h3>
                <p>By accessing this site, you agree to be bound by these terms.</p>
                <h3>Use of Service</h3>
                <p>You agree to use our service only for lawful purposes.</p>
            """,
            "meta_title": "Terms & Conditions",
            "meta_description": "Our terms and conditions of use."
        }
    ]

    for p in pages_data:
        page, created = Page.objects.update_or_create(
            slug=p['slug'],
            defaults={
                'title': p['title'],
                'page_type': p['page_type'],
                'show_in_footer': p['show_in_footer'],
                'published': True,
                'content': p['content'],
                'meta_title': p['meta_title'],
                'meta_description': p['meta_description']
            }
        )
        if created:
            print(f"Created page: {p['title']}")
        else:
            print(f"Updated page: {p['title']}")

    # Ensure SiteConfig exists
    if not SiteConfig.objects.exists():
        SiteConfig.objects.create(
            brand_name="Auto Insurance Savings",
            email="support@autoinsurance.org",
            phone_number="(800) 123-4567"
        )
        print("Created default SiteConfig")

if __name__ == '__main__':
    seed_pages()
