# 📋 Team Task Manager

A full-stack web app for managing projects, teams, and tasks with role-based access control.

## 🌐 Live Demo
👉 **https://team-task-manager-production-xxxx.up.railway.app**

## 🎬 Demo Video
👉 **https://www.loom.com/share/your-video-id**

## 🚀 Tech Stack
- **Backend:** FastAPI (Python 3.12)
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

## 🧪 Test Credentials
- **Admin:** admin@demo.com / password123
- **Member:** john@demo.com / password123

## ⚙️ Local Setup

```bash
git clone https://github.com/YOUR_USERNAME/team-task-manager.git
cd team-task-manager
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt

Create .env file
SECRET_KEY=your-secret-key
DATABASE_URL=sqlite:///./taskmanager.db

run
uvicorn app.main:app --reload
