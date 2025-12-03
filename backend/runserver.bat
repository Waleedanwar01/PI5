@echo off
cd /d "%~dp0"
set DATABASE_URL=sqlite:///db.sqlite3
python manage.py runserver
pause