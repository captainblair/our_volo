# API Docs (DRF + JWT)

Base URL: `http://localhost:8000/api`

## Auth
- `POST /auth/token/` — { username, password }
- `POST /auth/token/refresh/` — { refresh }

## Users
- `POST /users/register/` — Create user (Admin can also create via /users/manage/)
  ```json
  { "username":"eve", "email":"eve@volo.africa", "first_name":"Eve", "last_name":"A.", "password":"Pass@1234", "role_id":3, "department_id":4 }
  ```
- `GET /users/me/` — current user
- `GET/POST/PUT/DELETE /users/manage/` — Admin CRUD users
- `GET /departments/` — list departments

## Tasks
- `GET /tasks/` — tasks in your department
- `POST /tasks/`
  ```json
  { "task_title":"Prepare deck", "task_desc":"Slides for Monday", "assigned_to": 3, "due_date":"2025-10-01" }
  ```
- `PUT /tasks/{id}/` — update status (assignee) or content (manager/admin)

## Messaging
- `GET /messaging/department/` — list messages
- `POST /messaging/department/`
  ```json
  { "message_body":"Hello team!" }
  ```

## Notifications
- `GET /notifications/` — list notifications for current user
- WebSocket: `ws://localhost:8000/ws/notifications/`

## Admin Panel
- `GET /adminpanel/logs/` — audit logs (Admin only)
