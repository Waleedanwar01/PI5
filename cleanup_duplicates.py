#!/usr/bin/env python
import os
import sys
import django

# Setup Django
sys.path.insert(0, 'backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from content.models import InsuranceCompany, InsuranceCoverage
from django.db import models

print('=== CLEANING UP DUPLICATE COVERAGE RECORDS ===')

# Find and remove duplicate coverage records
coverage_groups = InsuranceCoverage.objects.values('company_id', 'state_code', 'covers_entire_state', 'zip_range_start', 'zip_range_end').annotate(count=models.Count('id'))

duplicates = []
for group in coverage_groups:
    if group['count'] > 1:
        print(f"Found {group['count']} duplicate records for company {group['company_id']} in state {group['state_code']}")
        
        # Keep the first record and delete the rest
        duplicate_records = InsuranceCoverage.objects.filter(
            company_id=group['company_id'],
            state_code=group['state_code'],
            covers_entire_state=group['covers_entire_state'],
            zip_range_start=group['zip_range_start'],
            zip_range_end=group['zip_range_end']
        ).order_by('id')[1:]  # Skip the first one (keep it)
        
        for record in duplicate_records:
            print(f"Deleting duplicate: {record}")
            record.delete()

print('\n=== FINAL COVERAGE RECORDS ===')
coverages = InsuranceCoverage.objects.all().select_related('company')
print(f'Total coverages after cleanup: {coverages.count()}')
for cov in coverages:
    print(f'- {cov.company.name} in {cov.state_code} (state-wide: {cov.covers_entire_state}, start: {cov.zip_range_start}, end: {cov.zip_range_end})')

print('\n=== TESTING ZIP 90000 AGAIN ===')
test_zip = '90000'
matching_companies = []
seen_companies = set()

for cov in coverages:
    if cov.matches_zip(test_zip) and cov.company.slug not in seen_companies:
        matching_companies.append(cov.company.name)
        seen_companies.add(cov.company.slug)
        
print(f'Unique companies matching ZIP {test_zip}: {len(matching_companies)}')
for company in matching_companies:
    print(f'- {company}')