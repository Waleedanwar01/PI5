from django.db import migrations
from django.utils.text import slugify


STATES = [
    "Alaska",
    "Alabama",
    "Arkansas",
    "Arizona",
    "California",
    "Colorado",
    "Connecticut",
    "Delaware",
    "Florida",
    "Georgia",
    "Hawaii",
    "Iowa",
    "Idaho",
    "Illinois",
    "Indiana",
    "Kansas",
    "Kentucky",
    "Louisiana",
    "Massachusetts",
    "Maine",
    "Maryland",
    "Michigan",
    "Minnesota",
    "Mississippi",
    "Missouri",
    "Montana",
    "Nebraska",
    "Nevada",
    "New Hampshire",
    "New Jersey",
    "New Mexico",
    "New York",
    "North Carolina",
    "North Dakota",
    "Ohio",
    "Oklahoma",
    "Oregon",
    "Pennsylvania",
    "Rhode Island",
    "South Carolina",
    "South Dakota",
    "Tennessee",
    "Texas",
    "Utah",
    "Vermont",
    "Virginia",
    "Washington",
    "West Virginia",
    "Washington DC",
    "Wisconsin",
    "Wyoming",
]


def create_states_categories(apps, schema_editor):
    MainPage = apps.get_model('content', 'MainPage')
    Category = apps.get_model('content', 'Category')

    states_name = "States"
    states_slug = slugify(states_name)
    # Use name as the lookup to avoid duplicate names causing IntegrityError
    states_parent, created = MainPage.objects.get_or_create(
        name=states_name,
        defaults={
            "slug": states_slug,
            "order": 70,
            "show_in_header": True,
            "has_dropdown": True,
        },
    )
    # If it existed with a different slug, normalize the slug once
    if not states_parent.slug:
        states_parent.slug = states_slug
        states_parent.save(update_fields=["slug"])

    for state in STATES:
        Category.objects.get_or_create(
            parent_page=states_parent,
            slug=slugify(state),
            defaults={"name": state},
        )


class Migration(migrations.Migration):
    dependencies = [
        ("content", "0037_add_initial_categories"),
    ]

    operations = [
        migrations.RunPython(create_states_categories, reverse_code=migrations.RunPython.noop),
    ]