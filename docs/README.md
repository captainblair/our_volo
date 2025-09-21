# Volo Africa — Departmental Communication & Task Allocation System

Production-ready internal web app to bridge communication gaps between departments and ensure proper task allocation and tracking.

## Core Features
- JWT auth (signup, login, refresh)
- Roles: **Admin**, **Department Manager**, **Staff**
- Department-scoped chat and task allocation
- Task tracking (pending, in-progress, completed)
- Admin dashboard with **audit logs**
- Real-time notifications (WebSocket) with REST fallback
- MySQL (XAMPP), Django backend, React + Tailwind frontend

## Tech
- Backend: Django + DRF + SimpleJWT + Channels
- Frontend: React + Tailwind + Vite
- DB: MySQL
- Tools: VS Code, Git/GitHub, Postman, ChatGPT

See `docs/INSTALLATION.md` for setup.
