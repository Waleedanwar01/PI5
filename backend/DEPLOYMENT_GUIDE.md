# Render Deployment Guide for Backend

## Quick Fix for "gunicorn: command not found"

### Option 1: Automatic Configuration (Recommended)
Render will now automatically use the `render.yaml` file that has been added to your repository. This should fix the deployment issue automatically.

### Option 2: Manual Configuration
If the automatic configuration doesn't work, manually set these in your Render dashboard:

**1. Build Command:**
```bash
pip install -r requirements.txt
```

**2. Start Command:**
```bash
gunicorn backend.wsgi:application
```

**3. Root Directory:**
- Set to `backend` if you have a multi-directory repository
- Leave empty if the backend is at the repository root

## Environment Variables Required

Set these in your Render dashboard under Environment > Environment Variables:

```env
# Required - Generate a secure key
DJANGO_SECRET_KEY=your-super-secret-django-key-here

# Required - PostgreSQL database URL (use Neon PostgreSQL)
DATABASE_URL=postgresql://username:password@host:port/database

# Production settings
DJANGO_DEBUG=False
DJANGO_ALLOWED_HOSTS=*.onrender.com,your-domain.com
DJANGO_CSRF_TRUSTED_ORIGINS=https://your-app.onrender.com
```

## Database Setup (Neon PostgreSQL)

1. Go to [Neon](https://neon.tech)
2. Create a new project
3. Copy the connection string
4. Add it to DATABASE_URL in Render

## Files Updated

- ✅ `requirements.txt` - Added gunicorn with proper version
- ✅ `render.yaml` - Automatic deployment configuration
- ✅ `.gitignore` - Protects sensitive files

## Testing the Fix

After pushing to GitHub, Render should automatically deploy with the correct settings. Check the logs for successful gunicorn startup.

**Expected Success Message:**
```
Starting gunicorn 21.2.0
Listening at: http://0.0.0.0:10000
Using worker: sync
Booting worker with pid: 123