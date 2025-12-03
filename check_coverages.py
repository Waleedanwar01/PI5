#!/usr/bin/env python
"""
Quick script to inspect InsuranceCoverage matching for a given ZIP.
Usage: python check_coverages.py [ZIP]
Defaults to 30001 if no ZIP provided.
"""
import os
import sys
import django

# Add the backend directory to Python path and setup Django
sys.path.insert(0, 'backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from content.models import InsuranceCoverage

def main():
    zip_code = sys.argv[1] if len(sys.argv) > 1 else '30001'
    print(f"=== Checking coverages for ZIP {zip_code} ===")
    total = 0
    matches = 0
    for cov in InsuranceCoverage.objects.select_related('company').all():
        total += 1
        ok = False
        try:
            ok = cov.matches_zip(zip_code)
        except Exception as e:
            print(f"ERR: {cov.company.name} [{cov.state_code}] - matches_zip error: {e}")
            continue
        if ok:
            matches += 1
            c = cov.company
            ztxt = (cov.zip_codes_text or '').replace('\n', ' ').strip()
            if len(ztxt) > 80:
                ztxt = ztxt[:77] + '...'
            print(f"MATCH: {c.name} | published={c.published} | state={cov.state_code} | entire_state={cov.covers_entire_state} | range={cov.zip_range_start}-{cov.zip_range_end} | zips='{ztxt}'")
    print(f"Total coverages: {total}; Matches: {matches}")

if __name__ == '__main__':
    main()