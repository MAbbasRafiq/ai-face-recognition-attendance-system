import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()
# ---------------------------------------------------------------------------
# Database connection settings
# Change these values to match your PostgreSQL setup
# ---------------------------------------------------------------------------
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "5432")
DB_NAME = os.getenv("DB_NAME", "attendance_db")
DB_USER = os.getenv("DB_USER", "postgres")
DB_PASSWORD = os.getenv("DB_PASSWORD")


def get_connection():
    """
    Opens and returns a connection to the PostgreSQL database.
    Call this whenever you need to run a query.
    """
    connection = psycopg2.connect(
        host=DB_HOST,
        port=DB_PORT,
        dbname=DB_NAME,
        user=DB_USER,
        password=DB_PASSWORD
    )
    return connection


def create_tables():
    """
    Creates the required tables if they don't already exist.
    Run this once when the app starts.

    Tables:
      - students   : stores registered student info
      - attendance : stores each attendance record (one row per student per class)
    """
    connection = get_connection()
    cursor = connection.cursor()

    # Students table
    # folder_name is the folder we save their photos in, e.g. "40_Ali"
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS students (
            id          SERIAL PRIMARY KEY,
            student_id  VARCHAR(50) UNIQUE NOT NULL,
            name        VARCHAR(100) NOT NULL,
            folder_name VARCHAR(150) NOT NULL,
            created_at  TIMESTAMP DEFAULT NOW()
        )
    """)

    # Attendance table
    # subject: which class/subject, e.g. "AI" or "DSA"
    # date: the calendar date of the class
    # time: the time the face was recognised
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS attendance (
            id          SERIAL PRIMARY KEY,
            student_id  VARCHAR(50) NOT NULL,
            name        VARCHAR(100) NOT NULL,
            subject     VARCHAR(100) NOT NULL,
            date        DATE NOT NULL,
            time        TIME NOT NULL,
            UNIQUE (student_id, subject, date)
        )
    """)

    connection.commit()
    cursor.close()
    connection.close()
