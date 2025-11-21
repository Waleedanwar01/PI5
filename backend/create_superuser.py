#!/usr/bin/env python
import os
import django
import sys

# Add the backend directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth.models import User

# Create superuser
try:
    # Check if user already exists
    if User.objects.filter(username='admin').exists():
        print("User 'admin' already exists. Updating password...")
        user = User.objects.get(username='admin')
        user.email = 'admin@gmail.com'
        user.set_password('@Admin11!')
        user.is_superuser = True
        user.is_staff = True
        user.save()
        print("SUCCESS: Superuser 'admin' updated successfully!")
    else:
        print("Creating new superuser 'admin'...")
        user = User.objects.create_superuser(
            username='admin',
            email='admin@gmail.com',
            password='@Admin11!'
        )
        print("SUCCESS: Superuser 'admin' created successfully!")
    
    print(f"Username: admin")
    print(f"Email: admin@gmail.com")
    print(f"Password: @Admin11!")
    
except Exception as e:
    print(f"ERROR creating superuser: {e}")
    sys.exit(1)