# Volo Africa — Departmental Communication & Task Allocation System

A production-ready internal web application designed to bridge communication gaps between departments and ensure proper task allocation and tracking within organizations.

![Django](https://img.shields.io/badge/Django-5.0.6-green) ![React](https://img.shields.io/badge/React-18.2.0-blue) ![MySQL](https://img.shields.io/badge/MySQL-8.0-orange)

---

## 📋 Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Running the Application](#running-the-application)
- [Default Credentials](#default-credentials)
- [Key Features Explained](#key-features-explained)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Troubleshooting](#troubleshooting)

---

## ✨ Features

### Authentication & Authorization
- **JWT-based authentication** (access & refresh tokens)
- **User registration** with department assignment
- **Role-based access control**: Admin, Department Manager, Staff
- **Profile management** with picture upload (max 2MB, JPEG/PNG/GIF)
- **Password reset functionality**

### Task Management
- **Create, assign, and track tasks** within departments
- **Task status tracking**: Pending, In Progress, Completed
- **Priority levels**: Low, Medium, High
- **Due date management** with visual indicators
- **Task comments and collaboration**
- **Task filtering and search** by status, assignee, priority
- **Export tasks to PDF/Word** documents

### Messaging System
- **Department-scoped messaging**
- **Real-time notifications** (WebSocket support)
- **Message threading and replies**
- **Unread message indicators**

### Admin Dashboard
- **User management** (create, edit, delete users)
- **Role and department assignment**
- **System audit logs**
- **Department statistics and analytics**
- **Reports generation** (PDF/Word export)

### UI/UX Features
- **Modern, responsive design** with Tailwind CSS
- **Dark mode support**
- **Enhanced search bar** with filters
- **Calendar view** for tasks and deadlines
- **Notification bell** with real-time updates
- **Dashboard with statistics cards**
- **Mobile-friendly interface**

---

## 🛠 Tech Stack

### Backend
- **Django 5.0.6** - Web framework
- **Django REST Framework 3.15.2** - API development
- **SimpleJWT 5.3.1** - JWT authentication
- **Django Channels 4.1.0** - WebSocket support
- **PyMySQL 1.1.1** - MySQL database connector
- **Django CORS Headers 4.4.0** - Cross-origin resource sharing

### Frontend
- **React 18.2.0** - UI library
- **React Router DOM 6.23.1** - Client-side routing
- **Vite 5.3.1** - Build tool and dev server
- **Tailwind CSS 3.4.7** - Utility-first CSS framework
- **Axios 1.7.2** - HTTP client
- **React Icons 5.5.0** - Icon library
- **date-fns 4.1.0** - Date formatting
- **jsPDF 2.5.1** - PDF generation
- **docx 8.5.0** - Word document generation

### Database
- **MySQL 8.0** (via XAMPP)

### Development Tools
- **VS Code** - Code editor
- **Git/GitHub** - Version control
- **Postman** - API testing

---

## 📦 Prerequisites

Before running this project locally, ensure you have the following installed:

1. **XAMPP** (for MySQL)
   - Download: https://www.apachefriends.org/
   - MySQL must be running on port 3306

2. **Python 3.11+**
   - Download: https://www.python.org/downloads/
   - Verify: `python --version`

3. **Node.js 18+** and **npm**
   - Download: https://nodejs.org/
   - Verify: `node --version` and `npm --version`

4. **Git**
   - Download: https://git-scm.com/
   - Verify: `git --version`

5. **VS Code** (recommended)
   - Download: https://code.visualstudio.com/

---

## 🚀 Installation

### Step 1: Clone the Repository

```bash
git clone https://github.com/captainblair/our_volo.git
cd our_volo
```

### Step 2: Set Up the Database

1. **Start XAMPP** and ensure MySQL is running
2. Open **phpMyAdmin**: http://localhost/phpmyadmin
3. Create a new database named `volo_africa_comm`
4. Import the database schema:
   - Navigate to the `database` folder
   - Import `schema.sql` first
   - Then import `seed.sql` (contains default users and departments)

### Step 3: Set Up the Backend

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv .venv

# Activate virtual environment
# Windows:
.venv\Scripts\activate
# macOS/Linux:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file from example
copy .env.example .env  # Windows
# cp .env.example .env  # macOS/Linux

# Edit .env file with your MySQL credentials (if different from defaults)
# Default XAMPP MySQL: user=root, password=(empty)

# Run migrations
python manage.py migrate

# (Optional) Create a superuser for Django admin
python manage.py createsuperuser

# Start the backend server
python manage.py runserver 0.0.0.0:8000
```

The backend should now be running at: **http://localhost:8000**

### Step 4: Set Up the Frontend

Open a **new terminal window** (keep the backend running):

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend should now be running at: **http://localhost:5173**

---

## 🎮 Running the Application

### Starting the Application

1. **Start XAMPP** and ensure MySQL is running
2. **Start Backend** (Terminal 1):
   ```bash
   cd backend
   .venv\Scripts\activate  # Windows
   python manage.py runserver 0.0.0.0:8000
   ```
3. **Start Frontend** (Terminal 2):
   ```bash
   cd frontend
   npm run dev
   ```
4. Open your browser and navigate to: **http://localhost:5173**

### Stopping the Application

- Press `Ctrl + C` in both terminal windows
- Stop MySQL in XAMPP (optional)

---

## 🔑 Default Credentials

After importing the seed data, you can log in with these default accounts:

### Admin Account
- **Email**: `admin@volo.com`
- **Password**: `admin123`
- **Role**: Admin
- **Department**: IT

### Department Manager Account
- **Email**: `manager@volo.com`
- **Password**: `manager123`
- **Role**: Department Manager
- **Department**: HR

### Staff Account
- **Email**: `staff@volo.com`
- **Password**: `staff123`
- **Role**: Staff
- **Department**: Finance

**⚠️ Important**: Change these passwords immediately after first login in a production environment!

---

## 🎯 Key Features Explained

### 1. User Registration & Login

**Registration Flow:**
- Navigate to `/signup`
- Fill in: First Name, Last Name, Email, Password, Department
- System automatically assigns "Staff" role to new users
- Admin can later upgrade roles to "Department Manager" or "Admin"

**Login Flow:**
- Navigate to `/login`
- Enter email and password
- JWT tokens are stored in localStorage
- Automatic token refresh on expiry

### 2. Admin Features

**Admin Dashboard** (`/admin`):
- View all users across departments
- Create new users with specific roles
- Edit user details and assign departments
- Delete users (with confirmation)
- View system audit logs
- Generate reports

**Access Control:**
- Only users with "Admin" role can access admin features
- Regular users attempting to access admin routes are redirected

### 3. Task Management

**Creating Tasks:**
- Navigate to `/tasks`
- Click "New Task" button
- Fill in: Title, Description, Assignee, Priority, Due Date
- Tasks are automatically assigned to your department
- Task creator is recorded as "assigned_by"

**Task Status:**
- **Pending**: Newly created tasks
- **In Progress**: Tasks being worked on
- **Completed**: Finished tasks

**Task Features:**
- Filter by status, priority, or assignee
- Search by title or description
- View task details with comments
- Add comments for collaboration
- Export tasks to PDF or Word

### 4. Messaging System

**Department Messages:**
- Navigate to `/messages`
- View all messages in your department
- Send new messages to department members
- Real-time notifications for new messages
- Unread message indicators

### 5. Profile Management

**Profile Page** (`/profile`):
- View and edit personal information
- Upload profile picture (max 2MB, JPEG/PNG/GIF)
- Change password
- View assigned department and role

### 6. Reports & Export

**Export Options:**
- **PDF Export**: Tasks and reports in PDF format
- **Word Export**: Editable documents for tasks and reports
- Available in Tasks page and Reports page

### 7. Notifications

**Notification Bell:**
- Real-time notifications for:
  - New task assignments
  - Task status changes
  - New messages
  - System announcements
- Click to view notification details
- Mark as read functionality

---

## 📁 Project Structure

```
our_volo/
├── backend/
│   ├── apps/
│   │   ├── users/           # User management, auth, profiles
│   │   │   ├── models.py
│   │   │   ├── views.py
│   │   │   ├── serializers.py
│   │   │   ├── validators.py  # NEW: File validation utilities
│   │   │   └── permissions.py
│   │   ├── tasks/           # Task management
│   │   ├── messaging/       # Department messaging
│   │   ├── notifications/   # Real-time notifications
│   │   └── adminpanel/      # Admin dashboard
│   ├── volo_africa/         # Django settings
│   ├── manage.py
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Page components
│   │   ├── context/         # React context (Auth, Theme)
│   │   ├── services/        # API services
│   │   └── main.jsx         # App entry point
│   ├── package.json
│   └── tailwind.config.js
├── database/
│   ├── schema.sql           # Database structure
│   └── seed.sql             # Default data
├── docs/
│   ├── README.md
│   ├── INSTALLATION.md
│   └── API_DOCS.md
└── README.md                # This file
```

---

## 📚 API Documentation

### Authentication Endpoints

```
POST /api/users/register/          # Register new user
POST /api/auth/token/               # Login (get JWT tokens)
POST /api/auth/token/refresh/       # Refresh access token
GET  /api/users/me/                 # Get current user info
PUT  /api/users/me/                 # Update current user
POST /api/users/upload-profile-picture/  # Upload profile picture
```

### Task Endpoints

```
GET    /api/tasks/                  # List department tasks
POST   /api/tasks/                  # Create new task
GET    /api/tasks/{id}/             # Get task details
PUT    /api/tasks/{id}/             # Update task
DELETE /api/tasks/{id}/             # Delete task
POST   /api/tasks/{id}/change_status/  # Change task status
GET    /api/tasks/{id}/comments/    # Get task comments
POST   /api/tasks/{id}/comments/    # Add comment to task
```

### Messaging Endpoints

```
GET  /api/messaging/department/     # List department messages
POST /api/messaging/department/     # Send new message
GET  /api/messaging/{id}/           # Get message details
```

### Admin Endpoints

```
GET    /api/users/                  # List all users (admin only)
POST   /api/users/                  # Create user (admin only)
PUT    /api/users/{id}/             # Update user (admin only)
DELETE /api/users/{id}/             # Delete user (admin only)
GET    /api/departments/            # List departments
GET    /api/roles/                  # List roles
```

**Authentication Header:**
```
Authorization: Bearer <access_token>
```

For detailed API examples, see `docs/API_DOCS.md`

---

## 🐛 Troubleshooting

### Backend Issues

**Problem: "Access denied for user 'root'@'localhost'"**
- Solution: Check MySQL credentials in `backend/.env`
- Ensure XAMPP MySQL is running
- Default XAMPP: user=`root`, password=(empty)

**Problem: "Port 8000 is already in use"**
- Solution: Kill the process using port 8000 or use a different port:
  ```bash
  python manage.py runserver 8001
  ```

**Problem: "No module named 'rest_framework'"**
- Solution: Activate virtual environment and reinstall dependencies:
  ```bash
  .venv\Scripts\activate
  pip install -r requirements.txt
  ```

**Problem: "CSRF token missing or incorrect"**
- Solution: Check `CSRF_TRUSTED_ORIGINS` in `backend/.env`
- Should include: `http://localhost:5173`

### Frontend Issues

**Problem: "Cannot connect to backend"**
- Solution: Ensure backend is running on port 8000
- Check `frontend/src/services/api.js` baseURL is `http://localhost:8000`

**Problem: "npm install fails"**
- Solution: Delete `node_modules` and `package-lock.json`, then:
  ```bash
  npm cache clean --force
  npm install
  ```

**Problem: "Blank page after login"**
- Solution: Check browser console for errors
- Clear localStorage: `localStorage.clear()` in browser console
- Ensure backend is running and accessible

### Database Issues

**Problem: "Database does not exist"**
- Solution: Create database in phpMyAdmin:
  - Open http://localhost/phpmyadmin
  - Create database named `volo_africa_comm`
  - Import `database/schema.sql` and `database/seed.sql`

**Problem: "Table doesn't exist"**
- Solution: Run migrations:
  ```bash
  python manage.py migrate
  ```

### Common Issues

**Problem: "Login fails with correct credentials"**
- Solution: Check if seed data was imported
- Verify user exists in database
- Check browser console and backend logs for errors

**Problem: "Profile picture upload fails"**
- Solution: Check file size (max 2MB) and format (JPEG/PNG/GIF only)
- Ensure `backend/profile_pictures/` directory exists and is writable

**Problem: "Tasks not showing"**
- Solution: Ensure user is assigned to a department
- Check if tasks exist for that department
- Verify user has proper permissions

---

## 🤝 Contributing

This project was developed as part of the Software Development Laboratory course at Technical University of Kenya.

### Recent Improvements

**Design Principle Applied: Single Responsibility Principle (SRP)**
- Extracted file validation logic into separate `validators.py` utility class
- Improved code maintainability and testability
- Enhanced reusability across the application

For more details, see the commit: "Apply Single Responsibility Principle: Extract file validation logic into separate validator class"

---

## 📄 License

This project is developed for educational purposes at Technical University of Kenya.

---

## 👥 Team

**Course**: IBL 2305 – Software Development Laboratory  
**Institution**: Technical University of Kenya  
**Repository**: https://github.com/captainblair/our_volo.git

---

## 📞 Support

If you encounter any issues not covered in this README:

1. Check the `docs/` folder for additional documentation
2. Review the troubleshooting section above
3. Check the GitHub issues page
4. Contact the development team

---

## 🎓 Acknowledgments

- Technical University of Kenya
- Software Development Laboratory Course Instructors
- All contributors and team members

---

**Happy Coding! 🚀**
