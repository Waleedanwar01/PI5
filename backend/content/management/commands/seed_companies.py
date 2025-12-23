from django.core.management.base import BaseCommand
from content.models import InsuranceCompany, InsuranceCoverage


SAMPLE_COMPANIES = [
    {
        "name": "Progressive",
        "rating": 4.6,
        "short_description": "Drivers save by switching to Progressive. Fast online quotes.",
        "landing_url": "https://www.progressive.com/auto/quote/",
        "domain_url": "https://www.progressive.com/",
        "published": True,
        "coverages": {
            "NH": (3000, 3999),
            "NY": (10000, 14999),
            "TX": (75000, 79999),
        },
    },
    {
        "name": "GEICO",
        "rating": 4.5,
        "short_description": "Save 15% or more with GEICO. Simple, reliable coverage.",
        "landing_url": "https://www.geico.com/auto-insurance/",
        "domain_url": "https://www.geico.com/",
        "published": True,
        "coverages": {
            "NH": (3000, 3999),
            "CA": (90000, 96199),
            "TX": (75000, 79999),
        },
    },
    {
        "name": "State Farm",
        "rating": 4.4,
        "short_description": "Personalized policies and strong service from State Farm.",
        "landing_url": "https://www.statefarm.com/insurance/auto",
        "domain_url": "https://www.statefarm.com/",
        "published": True,
        "coverages": {
            "NY": (10000, 14999),
            "CA": (90000, 96199),
        },
    },
    {
        "name": "Allstate",
        "rating": 4.3,
        "short_description": "Quality auto insurance with helpful tools from Allstate.",
        "landing_url": "https://www.allstate.com/",
        "domain_url": "https://www.allstate.com/",
        "published": True,
        "coverages": {
            "NH": (3000, 3999),
            "CA": (90000, 96199),
        },
    },
]


class Command(BaseCommand):
    help = "Seed sample insurance companies and coverage by state/ZIP ranges"

    def handle(self, *args, **options):
        created_companies = 0
        updated_companies = 0
        created_coverages = 0

        for data in SAMPLE_COMPANIES:
            company, created = InsuranceCompany.objects.get_or_create(
                name=data["name"],
                defaults={
                    "short_description": data["short_description"],
                    "rating": data["rating"],
                    "landing_url": data["landing_url"],
                    "domain_url": data["domain_url"],
                    "published": data.get("published", True),
                },
            )

            if not created:
                # Update fields if company already exists
                company.short_description = data["short_description"]
                company.rating = data["rating"]
                company.landing_url = data["landing_url"]
                company.domain_url = data["domain_url"]
                company.published = data.get("published", True)
                company.save()
                updated_companies += 1
            else:
                created_companies += 1

            # Add coverages
            for state_code, zip_range in data["coverages"].items():
                cov, cov_created = InsuranceCoverage.objects.get_or_create(
                    company=company,
                    state_code=state_code,
                    zip_range_start=zip_range[0],
                    zip_range_end=zip_range[1],
                    defaults={"zip_codes_text": "", "covers_entire_state": False},
                )
                if cov_created:
                    created_coverages += 1

        self.stdout.write(self.style.SUCCESS(
            f"Seeded companies: created={created_companies}, updated={updated_companies}, coverages_created={created_coverages}"
        ))