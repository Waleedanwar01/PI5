# Project Insurance 2 (PI2)

This repository contains both the frontend (Next.js) and backend (Django) for the PI2 project.

## Structure
- `frontend/` – Next.js app (Tailwind CSS, App Router)
- `backend/` – Django app (REST API, media/static handling)

## Getting Started

### Frontend (Next.js)
1. `cd frontend`
2. Install dependencies: `npm install`
3. Set environment variables (do NOT commit `.env`):
   - `NEXT_PUBLIC_API_BASE` – Base URL for API (e.g., `http://localhost:8000`)
   - `NEXT_PUBLIC_SITE_URL` – Public site URL (e.g., `http://localhost:3000`)
4. Run dev server: `npm run dev`

### Backend (Django)
1. `cd backend`
2. Create & activate a virtual environment (Windows):
   - `python -m venv .venv`
   - `.venv\Scripts\activate`
3. Install dependencies: `pip install -r requirements.txt`
4. Create `.env` (do NOT commit) with at least:
   - `DJANGO_SECRET_KEY=...`
   - `DEBUG=True`
   - `ALLOWED_HOSTS=localhost,127.0.0.1`
   - `CSRF_TRUSTED_ORIGINS=http://localhost:3000`
5. Apply migrations and start server:
   - `python manage.py migrate`
   - `python manage.py runserver`

## Notes
- `.env` files are intentionally ignored and should never be pushed.
- For production, set proper environment variables and disable `DEBUG`.