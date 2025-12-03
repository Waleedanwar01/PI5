#!/usr/bin/env python
import os
import sys
import django

# Setup Django
sys.path.insert(0, 'backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from content.models import InsuranceCompany, InsuranceCoverage

print('=== INSURANCE COMPANIES ===')
companies = InsuranceCompany.objects.all()
print(f'Total companies: {companies.count()}')
for c in companies:
    print(f'- {c.name} (published: {c.published})')

print('\n=== INSURANCE COVERAGES ===')
coverages = InsuranceCoverage.objects.all()
print(f'Total coverages: {coverages.count()}')
for cov in coverages:
    print(f'- {cov.company.name} in {cov.state_code} (state-wide: {cov.covers_entire_state}, start: {cov.zip_range_start}, end: {cov.zip_range_end})')

print('\n=== TESTING ZIP 90000 ===')
test_zip = '90000'
matching_companies = []
for cov in coverages:
    if cov.matches_zip(test_zip):
        matching_companies.append(cov.company.name)
        
print(f'Companies matching ZIP {test_zip}: {len(matching_companies)}')
for company in matching_companies:
    print(f'- {company}')