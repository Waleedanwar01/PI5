from django.db import migrations
from django.utils.text import slugify


VEHICLE_MAKES = [
    "Acura", "Audi", "BMW", "Buick", "Cadillac", "Chevrolet", "Chrysler",
    "Dodge", "Ferrari", "Fiat", "Ford", "GMC", "Honda", "Hyundai", "Infiniti",
    "Jaguar", "Jeep", "Kia", "Lamborghini", "Lexus", "Lincoln", "Mazda",
    "Mercedes-Benz", "Mercury", "MINI", "Mitsubishi", "Nissan", "Porsche",
    "Scion", "Smart Car", "Subaru", "Tesla", "Toyota", "Volkswagen", "Volvo",
]

COMPANIES = [
    "Allstate",
    "Amica",
    "Auto-Owners",
    "Dairyland",
    "Direct Auto",
    "Erie",
    "Farmers",
    "Farm Bureau",
    "Geico",
    "The General",
    "The Hartford",
    "Infinity",
    "Lemonade",
    "Liberty Mutual",
    "Mercury",
    "National General",
    "Progressive",
    "Root",
    "SafeCo",
    "State Farm",
    "Travelers",
    "USAA",
]


def create_initial_categories(apps, schema_editor):
    MainPage = apps.get_model('content', 'MainPage')
    Category = apps.get_model('content', 'Category')

    # Vehicles parent
    vehicles_name = "Vehicles"
    vehicles_slug = slugify(vehicles_name)
    vehicles_parent, _ = MainPage.objects.get_or_create(
        slug=vehicles_slug,
        defaults={
            "name": vehicles_name,
            "order": 90,
            "show_in_header": True,
            "has_dropdown": True,
        },
    )
    for make in VEHICLE_MAKES:
        Category.objects.get_or_create(
            parent_page=vehicles_parent,
            slug=slugify(make),
            defaults={"name": make},
        )

    # Companies parent
    companies_name = "Companies"
    companies_slug = slugify(companies_name)
    companies_parent, _ = MainPage.objects.get_or_create(
        slug=companies_slug,
        defaults={
            "name": companies_name,
            "order": 80,
            "show_in_header": True,
            "has_dropdown": True,
        },
    )
    for comp in COMPANIES:
        Category.objects.get_or_create(
            parent_page=companies_parent,
            slug=slugify(comp),
            defaults={"name": comp},
        )


class Migration(migrations.Migration):
    dependencies = [
        ("content", "0036_cleanup_dropdown_and_remove_target_page"),
    ]

    operations = [
        migrations.RunPython(create_initial_categories, reverse_code=migrations.RunPython.noop),
    ]