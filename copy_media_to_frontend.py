#!/usr/bin/env python
import os
import shutil
from pathlib import Path

def copy_media_to_frontend():
    """Copy backend media files to frontend public directory"""
    
    # Define paths
    backend_media = Path("backend/media")
    frontend_public = Path("frontend/public")
    
    # Create images directory in frontend if it doesn't exist
    frontend_images = frontend_public / "images"
    frontend_images.mkdir(exist_ok=True)
    
    # Define which files to copy
    files_to_copy = [
        # Copy hero images
        "original_images/seeded-hero.png",
        "original_images/seeded-hero_FNC7k38.png",
        "original_images/seeded-hero_unuq3i3.png",
        "original_images/seeded-hero_UWDjUjG.png", 
        "original_images/seeded-hero_XqNLGGw.png",
        "original_images/seeded-hero_XuF61eW.png",
        
        # Copy blog author images
        "blog/authors/testimonials-1.jpg",
        
        # Copy site images
        "site/3fc2fa9d-aiorg-logo.svg",
        
        # Copy any existing screenshots
        "Screenshot_10-11-2025_133611_www.autoinsurance.org.jpeg",
        "homepage/Screenshot_10-11-2025_133611_www.autoinsurance.org.jpeg"
    ]
    
    copied_count = 0
    
    for file_path in files_to_copy:
        source = backend_media / file_path
        if source.exists():
            # Determine destination filename
            filename = source.name
            destination = frontend_images / filename
            
            # Copy the file
            try:
                shutil.copy2(source, destination)
                print(f"Copied: {file_path} -> frontend/public/images/{filename}")
                copied_count += 1
            except Exception as e:
                print(f"Error copying {file_path}: {e}")
        else:
            print(f"Source file not found: {source}")
    
    print(f"\nCompleted copying {copied_count} files to frontend/public/images/")
    
    # Also copy all uploaded images
    uploads_dir = backend_media / "uploads"
    if uploads_dir.exists():
        for upload_file in uploads_dir.rglob("*"):
            if upload_file.is_file():
                # Get relative path from uploads directory
                rel_path = upload_file.relative_to(uploads_dir)
                destination = frontend_images / "uploads" / rel_path
                destination.parent.mkdir(parents=True, exist_ok=True)
                
                try:
                    shutil.copy2(upload_file, destination)
                    print(f"Copied upload: {rel_path}")
                    copied_count += 1
                except Exception as e:
                    print(f"Error copying upload {rel_path}: {e}")

if __name__ == '__main__':
    copy_media_to_frontend()