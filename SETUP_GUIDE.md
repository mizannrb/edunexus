# 🎓 EduNexus — Complete Setup Guide
## "Building the Future of Learning Systems"

---

## 📁 PROJECT STRUCTURE

```
edunexus/
├── backend/                   ← FastAPI + PostgreSQL
│   ├── app/
│   │   ├── api/routes/        ← auth.py, users.py, courses.py, enrollments.py
│   │   ├── core/              ← config.py, security.py
│   │   ├── db/                ← database.py
│   │   ├── models/            ← user.py, course.py, enrollment.py
│   │   ├── schemas/           ← Pydantic schemas
│   │   └── main.py            ← FastAPI app entry
│   ├── requirements.txt
│   └── .env
└── frontend/                  ← React + Tailwind
    ├── src/
    │   ├── components/
    │   ├── pages/
    │   ├── services/api.js
    │   ├── store/authStore.js
    │   ├── App.jsx
    │   └── main.jsx
    ├── package.json
    └── vite.config.js
```

---

## ✅ STEP 1 — Install Prerequisites

### 1A. Install Python (if not installed)
1. Go to https://www.python.org/downloads/
2. Download Python 3.11 or 3.12
3. During install → **check "Add Python to PATH"**
4. Open terminal (PowerShell / CMD) and verify:
   ```
   python --version
   ```

### 1B. Install Node.js (for React frontend)
1. Go to https://nodejs.org
2. Download LTS version (20.x)
3. Install and verify:
   ```
   node --version
   npm --version
   ```

### 1C. Install PostgreSQL
1. Go to https://www.postgresql.org/download/
2. Download for your OS (Windows: use installer)
3. During setup:
   - Remember your **postgres password**!
   - Default port: **5432** ✅
   - Keep all defaults
4. After install, open **pgAdmin 4** (installed automatically)

---

## ✅ STEP 2 — Create PostgreSQL Database

### Using pgAdmin 4 (GUI):
1. Open pgAdmin 4
2. In left sidebar: expand **Servers → PostgreSQL**
3. Right-click **Databases** → **Create** → **Database**
4. Name: `edunexus`
5. Click **Save**

### Using Command Line (alternative):
```bash
# Open psql
psql -U postgres

# Inside psql, type:
CREATE DATABASE edunexus;
\q
```

---

## ✅ STEP 3 — Open Project in PyCharm

1. Open **PyCharm**
2. **File** → **Open** → select the `edunexus` folder
3. PyCharm will detect it as a project

---

## ✅ STEP 4 — Setup Python Virtual Environment

### In PyCharm terminal (bottom panel):
```bash
# Navigate to backend folder
cd backend

# Create virtual environment
python -m venv venv

# Activate it:
# Windows:
venv\Scripts\activate

# Mac/Linux:
source venv/bin/activate

# You should see (venv) in your terminal prompt
```

### In PyCharm (GUI way):
1. Go to **File** → **Settings** → **Project: edunexus** → **Python Interpreter**
2. Click ⚙️ gear → **Add Interpreter** → **Local Interpreter**
3. Select **Virtual Environment** → choose `backend/venv`

---

## ✅ STEP 5 — Install Python Dependencies

```bash
# Make sure you're in backend/ with venv active
pip install -r requirements.txt
```

Wait for all packages to install. You'll see them downloading.

---

## ✅ STEP 6 — Configure Database Connection

1. Open `backend/.env`
2. Update the DATABASE_URL with **your postgres password**:

```
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD_HERE@localhost:5432/edunexus
```

Replace `YOUR_PASSWORD_HERE` with the password you set during PostgreSQL installation.

---

## ✅ STEP 7 — Run the Backend Server

```bash
# Make sure you're in backend/ with venv active
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

You should see:
```
INFO:     Started server process
INFO:     Waiting for application startup.
✅ Admin created: admin@edunexus.com
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000
```

### ✨ View Swagger API Docs:
Open browser → http://localhost:8000/docs

You'll see ALL your API endpoints with full documentation!

---

## ✅ STEP 8 — Test API in Swagger

1. Go to http://localhost:8000/docs
2. Click **Authorize** button (🔒 top right)
3. Enter:
   - Username: `admin@edunexus.com`
   - Password: `Admin@123456`
4. Click **Authorize** → **Close**
5. Now test any endpoint by clicking it → **Try it out** → **Execute**

### Test Order:
1. **POST /api/v1/auth/register** — Create a user
2. **POST /api/v1/auth/login** — Login (get token)
3. **GET /api/v1/courses/** — List courses
4. **POST /api/v1/courses/** — Create course (admin)
5. **POST /api/v1/enrollments/** — Enroll in course

---

## ✅ STEP 9 — Setup React Frontend

Open a **new terminal window** (keep backend running!):

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

You'll see:
```
  VITE v5.x.x  ready in 500ms

  ➜  Local:   http://localhost:3000/
```

Open browser → http://localhost:3000

---

## ✅ STEP 10 — Use the Application

### As Admin:
1. Go to http://localhost:3000/login
2. Email: `admin@edunexus.com`
3. Password: `Admin@123456`
4. You'll be redirected to Admin Dashboard
5. Create courses, manage users, grant admin access

### As Student:
1. Go to http://localhost:3000/register
2. Create your account
3. Login and browse courses
4. Enroll in courses and track progress

---

## 🔍 HTTP METHODS IN SWAGGER

When you open http://localhost:8000/docs, each endpoint shows:

| Color | Method | Use |
|-------|--------|-----|
| 🟢 Green | **GET** | Retrieve data |
| 🔵 Blue | **POST** | Create new data |
| 🟡 Orange | **PUT** | Update existing data |
| 🔴 Red | **DELETE** | Delete data |

### How to test in Swagger:
1. Click an endpoint (e.g., `POST /api/v1/courses/`)
2. Click **Try it out**
3. Fill in the request body (JSON)
4. Click **Execute**
5. See response below

---

## 📋 ALL API ENDPOINTS

### 🔐 Authentication (`/api/v1/auth/`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /auth/register | Register new user |
| POST | /auth/login | Login (returns JWT token) |
| POST | /auth/login/form | Swagger OAuth2 login |
| GET | /auth/me | Get current user |

### 👤 Users (`/api/v1/users/`) — Admin only
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /users/ | List all users |
| GET | /users/{id} | Get specific user |
| PUT | /users/me/profile | Update own profile |
| PUT | /users/me/password | Change password |
| PUT | /users/{id} | Admin update user |
| DELETE | /users/{id} | Delete user |
| POST | /users/{id}/make-admin | Grant admin role |
| POST | /users/{id}/revoke-admin | Revoke admin role |

### 📚 Courses (`/api/v1/courses/`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /courses/ | List published courses |
| GET | /courses/admin/all | All courses (admin) |
| GET | /courses/{slug} | Get course details |
| POST | /courses/ | Create course (admin) |
| PUT | /courses/{id} | Update course (admin) |
| DELETE | /courses/{id} | Delete course (admin) |
| POST | /courses/{id}/modules | Add module |
| PUT | /courses/{id}/modules/{mid} | Update module |
| DELETE | /courses/{id}/modules/{mid} | Delete module |
| POST | /courses/{id}/modules/{mid}/lessons | Add lesson |
| PUT | /courses/{id}/modules/{mid}/lessons/{lid} | Update lesson |
| DELETE | /courses/{id}/modules/{mid}/lessons/{lid} | Delete lesson |

### 🎯 Enrollments (`/api/v1/enrollments/`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /enrollments/ | Enroll in course |
| GET | /enrollments/my | My enrollments |
| POST | /enrollments/{id}/progress | Update lesson progress |
| DELETE | /enrollments/{id} | Unenroll |
| GET | /enrollments/admin/stats | Dashboard statistics |

---

## 🛠️ COMMON TROUBLESHOOTING

### ❌ "Can't connect to database"
- Make sure PostgreSQL is running
- Check your password in `.env`
- Verify database name is `edunexus`

### ❌ "Module not found" in Python
- Make sure venv is activated: `venv\Scripts\activate`
- Run: `pip install -r requirements.txt` again

### ❌ "npm: command not found"
- Reinstall Node.js from nodejs.org

### ❌ Frontend shows CORS error
- Make sure backend is running on port 8000
- Vite proxy is configured in vite.config.js

### ❌ "Port 8000 already in use"
```bash
# Kill the process using port 8000
# Windows:
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Mac/Linux:
lsof -ti:8000 | xargs kill
```

---

## 🔄 RUNNING BOTH SERVERS

Open **2 terminal windows**:

**Terminal 1 (Backend):**
```bash
cd backend
venv\Scripts\activate   # Windows
uvicorn app.main:app --reload --port 8000
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```

Then open:
- 🌐 Frontend: http://localhost:3000
- 📖 API Docs: http://localhost:8000/docs
- 📘 ReDoc: http://localhost:8000/redoc

---

## 🏆 DEFAULT CREDENTIALS

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@edunexus.com | Admin@123456 |

*Change these in `.env` for production!*
