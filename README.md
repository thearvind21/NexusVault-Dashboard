# NexusVault Dashboard 🛡️

A premium, secure, and scalable dashboard application built with Next.js 15 and FastAPI.

![Dashboard Preview](https://via.placeholder.com/1200x600?text=NexusVault+Dashboard)

## 🚀 Key Features

*   **Modern UI:** Glassmorphism design system using TailwindCSS v4 and Framer Motion.
*   **Authentication:** Full JWT-based auth flow (Login, Register, Profile Management) with secure password hashing.
*   **Task Management:** Complete CRUD operations for tasks with real-time filtering, searching, and status updates.
*   **Responsive:** Fully optimized for mobile, tablet, and desktop views.
*   **Scalable Architecture:** Modular backend structure (FastAPI) and component-based frontend (React/Next.js).

## 🛠️ Tech Stack

### Frontend (`/nexus-app`)
*   **Framework:** Next.js 15 (App Router)
*   **Styling:** TailwindCSS v4
*   **Animations:** Framer Motion
*   **State/Validation:** React Hook Form, Zod
*   **Icons:** Phosphor React

### Backend (`/backend`)
*   **Framework:** FastAPI
*   **Database:** SQLite (SQLAlchemy ORM, easily swappable to PostgreSQL)
*   **Auth:** JWT (JSON Web Tokens), Passlib (Bcrypt)
*   **Validation:** Pydantic V2

## 📦 Installation & Setup

### Prerequisites
*   Node.js (v18+)
*   Python (v3.10+)

### 1. Backend Setup
```bash
cd backend
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

pip install -r requirements.txt
python -m app.main
```
The API will start at `http://localhost:8000`.

### 2. Frontend Setup
```bash
cd nexus-app
npm install
npm run dev
```
The app will open at `http://localhost:3000`.

## 🧪 API Documentation
Once the backend is running, visit:
*   **Swagger UI:** `http://localhost:8000/docs`
*   **ReDoc:** `http://localhost:8000/redoc`

## 🔒 Security Measures
*   **Password Hashing:** Uses Bcrypt for secure password storage.
*   **JWT Tokens:** Stateless authentication with expiration.
*   **Protected Routes:** Frontend middleware prevents unauthorized access.
*   **CORS:** Configured to allow only trusted frontend origins.

## 📈 Scalability Strategies
*   **Database:** Uses SQLAlchemy ORM, making migration to PostgreSQL seamless by changing the database URL.
*   **Containerization:** Ready for Docker integration (Dockerfile not included in this minimal task but easily addable).
*   **Modular Code:** Separated routers (`auth`, `tasks`) and components for maintainability.

---
**Author:** [Your Name]
