from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import date, time, datetime

from database import create_tables, get_connection
from face_recognition_utils import (
    register_student_photos,
    generate_encodings,
    run_live_recognition
)

# ---------------------------------------------------------------------------
# App setup
# ---------------------------------------------------------------------------
app = FastAPI(title="AI Attendance System API")

# Allow the React frontend (running on port 5173 or 3000) to call this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Create database tables when the server starts
# ---------------------------------------------------------------------------
@app.on_event("startup")
def on_startup():
    create_tables()
    print("Database tables are ready.")


# ---------------------------------------------------------------------------
# Request body models (what JSON the frontend sends us)
# ---------------------------------------------------------------------------
class RegisterStudentRequest(BaseModel):
    student_id: str
    name: str

class StartAttendanceRequest(BaseModel):
    subject: str


# ---------------------------------------------------------------------------
# Helper: mark attendance in PostgreSQL
# ---------------------------------------------------------------------------
def mark_attendance_in_db(folder_name: str, subject: str) -> bool:
    """
    Inserts one attendance record into the database.
    folder_name looks like "40_Ali" — we split it to get student_id and name.
    Returns True if attendance was newly recorded, False if already recorded today.
    """
    # folder_name format is "studentid_studentname" e.g. "40_Ali"
    parts = folder_name.split("_", 1)  # split only on the FIRST underscore
    if len(parts) != 2:
        return False

    student_id = parts[0]
    student_name = parts[1]
    today = datetime.now().date()
    current_time = datetime.now().time()

    connection = get_connection()
    cursor = connection.cursor()

    try:
        cursor.execute("""
            INSERT INTO attendance (student_id, name, subject, date, time)
            VALUES (%s, %s, %s, %s, %s)
        """, (student_id, student_name, subject, today, current_time))

        connection.commit()
        return True  # Successfully inserted = newly marked

    except Exception:
        # The UNIQUE constraint (student_id, subject, date) prevents duplicates.
        # If it fails, that means attendance was already marked today.
        connection.rollback()
        return False

    finally:
        cursor.close()
        connection.close()


# ===========================================================================
# ROUTE 1: Register a new student
# POST /register
# ===========================================================================
@app.post("/register")
def register_student(request: RegisterStudentRequest):
    """
    Registers a student by:
    1. Saving their info to the students table in PostgreSQL
    2. Opening the webcam to capture 25 face photos
    """
    connection = get_connection()
    cursor = connection.cursor()

    # Build the folder name that photos will be saved in
    folder_name = f"{request.student_id}_{request.name}"

    # Check if this student ID already exists
    cursor.execute("SELECT id FROM students WHERE student_id = %s", (request.student_id,))
    existing = cursor.fetchone()

    if existing:
        cursor.close()
        connection.close()
        raise HTTPException(status_code=400, detail="Student ID already exists")

    # Save to database
    cursor.execute("""
        INSERT INTO students (student_id, name, folder_name)
        VALUES (%s, %s, %s)
    """, (request.student_id, request.name, folder_name))

    connection.commit()
    cursor.close()
    connection.close()

    # Open webcam and capture photos
    register_student_photos(request.student_id, request.name)

    return {"message": f"Student {request.name} registered successfully"}


# ===========================================================================
# ROUTE 2: Generate face encodings
# POST /generate-encodings
# ===========================================================================
@app.post("/generate-encodings")
def generate_face_encodings():
    """
    Reads all student photos and creates face embeddings (encodings).
    This must be run after registering new students.
    """
    count = generate_encodings()
    return {"message": f"Generated {count} face encodings successfully"}


# ===========================================================================
# ROUTE 3: Start live attendance
# POST /start-attendance
# ===========================================================================
@app.post("/start-attendance")
def start_attendance(request: StartAttendanceRequest):
    """
    Opens the webcam, recognises faces, and marks attendance in PostgreSQL.
    Press Q on the camera window to stop.
    """
    if not request.subject.strip():
        raise HTTPException(status_code=400, detail="Subject name is required")

    # Pass our database function as a callback so face_recognition_utils
    # doesn't need to know anything about the database
    run_live_recognition(
        subject=request.subject,
        mark_attendance_callback=mark_attendance_in_db
    )

    return {"message": f"Attendance session for '{request.subject}' completed"}


# ===========================================================================
# ROUTE 4: Get all students
# GET /students
# ===========================================================================
@app.get("/students")
def get_all_students():
    """
    Returns a list of all registered students from the database.
    """
    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute("SELECT student_id, name, created_at FROM students ORDER BY created_at DESC")
    rows = cursor.fetchall()

    cursor.close()
    connection.close()

    students = []
    for row in rows:
        students.append({
            "student_id": row[0],
            "name": row[1],
            "registered_at": str(row[2])
        })

    return {"students": students}


# ===========================================================================
# ROUTE 5: Get attendance records (with optional filters)
# GET /attendance?subject=AI&date=2026-01-03
# ===========================================================================
@app.get("/attendance")
def get_attendance(subject: str = None, date: str = None):
    """
    Returns attendance records.
    You can filter by subject, date, or both.
    Example: /attendance?subject=AI&date=2026-01-03
    """
    connection = get_connection()
    cursor = connection.cursor()

    # Build the query dynamically based on which filters are provided
    query = "SELECT student_id, name, subject, date, time FROM attendance WHERE 1=1"
    params = []

    if subject:
        query += " AND subject = %s"
        params.append(subject)

    if date:
        query += " AND date = %s"
        params.append(date)

    query += " ORDER BY date DESC, time DESC"

    cursor.execute(query, params)
    rows = cursor.fetchall()

    cursor.close()
    connection.close()

    records = []
    for row in rows:
        records.append({
            "student_id": row[0],
            "name": row[1],
            "subject": row[2],
            "date": str(row[3]),
            "time": str(row[4])
        })

    return {"records": records, "total": len(records)}


# ===========================================================================
# ROUTE 6: Get list of all subjects that have attendance data
# GET /subjects
# ===========================================================================
@app.get("/subjects")
def get_subjects():
    """
    Returns the list of unique subjects that have at least one attendance record.
    Used by the dashboard to populate the subject dropdown.
    """
    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute("SELECT DISTINCT subject FROM attendance ORDER BY subject")
    rows = cursor.fetchall()

    cursor.close()
    connection.close()

    subjects = [row[0] for row in rows]
    return {"subjects": subjects}


# ===========================================================================
# ROUTE 7: Get attendance summary (count per student for a subject)
# GET /attendance/summary?subject=AI
# ===========================================================================
@app.get("/attendance/summary")
def get_attendance_summary(subject: str):
    """
    Returns how many times each student has attended a given subject,
    including total class days held and attendance percentage.
    Used for the bar chart and stats on the dashboard.
    """
    connection = get_connection()
    cursor = connection.cursor()

    # Get total unique class days held for this subject
    cursor.execute("""
        SELECT COUNT(DISTINCT date) as total_days
        FROM attendance
        WHERE subject = %s
    """, (subject,))
    total_days_row = cursor.fetchone()
    total_days = total_days_row[0] if total_days_row else 0

    # Get all registered students
    cursor.execute("SELECT student_id, name FROM students ORDER BY name")
    all_students = cursor.fetchall()

    # Get attendance count per student for this subject
    cursor.execute("""
        SELECT student_id, name, COUNT(*) as attended
        FROM attendance
        WHERE subject = %s
        GROUP BY student_id, name
    """, (subject,))
    attended_rows = cursor.fetchall()

    cursor.close()
    connection.close()

    # Build a lookup of attended counts
    attended_map = {row[0]: {"name": row[1], "attended": row[2]} for row in attended_rows}

    summary = []
    for student_id, name in all_students:
        attended = attended_map.get(student_id, {}).get("attended", 0)
        percentage = round((attended / total_days * 100), 1) if total_days > 0 else 0
        summary.append({
            "student_id": student_id,
            "name": name,
            "attended": attended,
            "total_days": total_days,
            "percentage": percentage,
        })

    # Sort by percentage descending
    summary.sort(key=lambda x: x["percentage"], reverse=True)

    return {"summary": summary, "total_days": total_days}


# ===========================================================================
# ROUTE 8: Get per-student attendance detail for a subject
# GET /attendance/student?subject=AI&student_id=40
# ===========================================================================
@app.get("/attendance/student")
def get_student_attendance(subject: str, student_id: str):
    """
    Returns all attendance records for a specific student in a subject.
    """
    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute("""
        SELECT date, time
        FROM attendance
        WHERE subject = %s AND student_id = %s
        ORDER BY date DESC
    """, (subject, student_id))

    rows = cursor.fetchall()
    cursor.close()
    connection.close()

    records = [{"date": str(row[0]), "time": str(row[1])} for row in rows]
    return {"records": records}
