# Installation Guide

## 1) Prerequisites
- **XAMPP** (MySQL running on 3306)
- **Python 3.11+**, **Node 18+**
- **VS Code**, **Git**
- (Optional) **Redis** if you want a production-grade channel layer (not required for dev)

## 2) Create Database (phpMyAdmin)
1. Start XAMPP → Start **MySQL**.
2. Open phpMyAdmin: http://localhost/phpmyadmin
3. Import `database/schema.sql` then `database/seed.sql`.
   - Ensure DB name is `volo_africa_comm`.

## 3) Backend
```bash
cd backend
python -m venv .venv && source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
python manage.py migrate
python manage.py createsuperuser  # optional
python manage.py runserver 0.0.0.0:8000
```

## 4) Frontend
```bash
cd ../frontend
npm install
npm run dev  # http://localhost:5173
```

## 5) Configure Backend DB
- Edit `backend/.env` if your MySQL creds differ (XAMPP default user: `root`, no password).

## 6) Postman
- Import endpoints from `docs/API_DOCS.md` (examples ready).
- Flow:
  - Register `/api/users/register/` or login `/api/auth/token/`.
  - Use `Authorization: Bearer <token>` for subsequent calls.

## Notes
- Real-time notifications use Channels with **in-memory** layer by default for dev.
- For production, set up Redis and configure `CHANNEL_LAYERS` accordingly.
