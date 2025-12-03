#!/usr/bin/env python
"""
Development server runner that ensures SQLite database is used
"""
import os
import sys
import subprocess

# Set the SQLite database URL for development
os.environ['DATABASE_URL'] = 'sqlite:///db.sqlite3'
os.environ['DJANGO_SECRET_KEY'] = 'django-insecure-development-key-change-in-production-123456789'
os.environ['DJANGO_DEBUG'] = 'True'

# Change to the directory containing manage.py
script_dir = os.path.dirname(os.path.abspath(__file__))
os.chdir(script_dir)

# Run Django development server
subprocess.run([sys.executable, 'manage.py', 'runserver'])