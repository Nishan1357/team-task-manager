# 📋 Team Task Manager

A full-stack web app for managing projects, teams, and tasks with role-based access control.

## 🚀 Tech Stack
- **Backend:** FastAPI (Python)
- **Database:** PostgreSQL (Production) / SQLite (Local)
- **Auth:** JWT (JSON Web Tokens)
- **Frontend:** Vanilla HTML/CSS/JavaScript
- **Deployment:** Railway

## ✨ Features
- 🔐 JWT Authentication (Signup/Login)
- 👥 Role-Based Access Control (Admin/Member)
- 📁 Project & Team Management
- ✅ Task Creation, Assignment & Status Tracking
- 📊 Dashboard with Overdue Detection
- 🎨 Kanban Board View

## ⚙️ Local Setup

```bash
git clone https://github.com/YOUR_USERNAME/team-task-manager.git
cd team-task-manager
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
uvicorn app.main:app --reload
```

Visit: http://localhost:8000

## 🌐 Live Demo
[Live App](https://your-app.up.railway.app)

## 📡 API Documentation
Swagger UI: `/docs`

## 📝 License
MIT