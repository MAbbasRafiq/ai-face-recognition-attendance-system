# AI Attendance System — FastAPI + PostgreSQL + React

A face recognition attendance system.
- **Backend**: FastAPI (Python) handles the camera, face recognition, and database
- **Database**: PostgreSQL stores students and attendance records
- **Frontend**: React shows the UI in the browser

---

## Project Structure

```
attendance-system/
├── backend/
│   ├── main.py                   ← FastAPI routes (all API endpoints)
│   ├── database.py               ← PostgreSQL connection and table setup
│   ├── face_recognition_utils.py ← Camera, registration, recognition logic
│   └── requirements.txt          ← Python packages needed
│
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── main.jsx              ← React entry point
│       ├── App.jsx               ← Tab navigation
│       ├── index.css             ← All styles
│       ├── api.js                ← Functions that call the FastAPI backend
│       ├── RegisterPage.jsx      ← Register a student + generate encodings
│       ├── AttendancePage.jsx    ← Start live attendance session
│       ├── DashboardPage.jsx     ← View attendance records and chart
│       └── StudentsPage.jsx      ← View all registered students
│
└── data/                         ← Copy this from your original project
    ├── haarcascade_frontalface_default.xml
    ├── encodings.pkl             ← Generated automatically
    ├── students/                 ← Student photo folders go here
    └── attendance/               ← No longer used (data is in PostgreSQL now)
```

---

## Step 1 — Set up PostgreSQL

1. Install PostgreSQL if you haven't already.
2. Open the PostgreSQL shell (psql) and run:

```sql
CREATE DATABASE attendance_db;
```

3. Open `backend/database.py` and update these lines with your credentials:

```python
DB_NAME     = "attendance_db"
DB_USER     = "postgres"
DB_PASSWORD = "your_password_here"
DB_HOST     = "localhost"
DB_PORT     = "5432"
```

The tables (`students` and `attendance`) are created automatically when you
start the backend for the first time.

---

## Step 2 — Copy your data folder

Copy the `data/` folder from your original project into `backend/`:

```
backend/
└── data/
    ├── haarcascade_frontalface_default.xml   ← required
    ├── students/                              ← your existing student photos
    └── encodings.pkl                          ← optional, will be regenerated
```

---

## Step 3 — Run the Backend

Open a terminal in the `backend/` folder:

```bash
# Install Python packages
pip install -r requirements.txt

# Start the FastAPI server
uvicorn main:app --reload
```

The API will be available at: http://localhost:8000

You can also view the auto-generated API docs at: http://localhost:8000/docs

---

## Step 4 — Run the Frontend

Open a second terminal in the `frontend/` folder:

```bash
# Install Node packages (only needed once)
npm install

# Start the React dev server
npm run dev
```

Open your browser at: http://localhost:5173

---

## How to Use

### Register a Student
1. Click the **Register Student** tab
2. Enter the student's ID (e.g. `40`) and Name (e.g. `Ali`)
3. Click **Register Face (Opens Camera)**
4. The camera opens — the student should look at it. 25 photos are taken automatically.
5. After registering all new students, click **Generate Face Encodings**
   (you must do this before taking attendance)

### Take Attendance
1. Click the **Take Attendance** tab
2. Enter the subject name (e.g. `AI` or `DSA`)
3. Click **Start Attendance (Opens Camera)**
4. The camera opens and starts recognising faces
5. Press **Q** on the camera window when done

### View Dashboard
1. Click the **Dashboard** tab
2. Select a subject (and optionally a date)
3. Click **Search**
4. You'll see the attendance table, total count, and a bar chart

### View All Students
- Click the **All Students** tab to see everyone registered in the database

---

## API Endpoints (for reference)

| Method | URL | Description |
|--------|-----|-------------|
| POST | /register | Register a student (opens camera) |
| POST | /generate-encodings | Build face encodings from photos |
| POST | /start-attendance | Start live attendance (opens camera) |
| GET  | /students | List all registered students |
| GET  | /attendance | Get attendance records (filter by ?subject=&date=) |
| GET  | /subjects | List subjects that have attendance data |
| GET  | /attendance/summary | Count per student for a subject |
