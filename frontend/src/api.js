// This file contains all the functions that talk to the FastAPI backend.
// The base URL points to wherever uvicorn is running.
const BASE_URL = "http://localhost:8000"


// Register a new student (saves to DB and opens webcam)
export async function registerStudent(studentId, name) {
  const response = await fetch(`${BASE_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ student_id: studentId, name: name })
  })
  const data = await response.json()
  if (!response.ok) {
    throw new Error(data.detail || "Registration failed")
  }
  return data
}


// Tell the backend to re-scan all student photos and rebuild encodings
export async function generateEncodings() {
  const response = await fetch(`${BASE_URL}/generate-encodings`, {
    method: "POST"
  })
  const data = await response.json()
  if (!response.ok) {
    throw new Error(data.detail || "Failed to generate encodings")
  }
  return data
}


// Start a live attendance session for a given subject
export async function startAttendance(subject) {
  const response = await fetch(`${BASE_URL}/start-attendance`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ subject: subject })
  })
  const data = await response.json()
  if (!response.ok) {
    throw new Error(data.detail || "Failed to start attendance")
  }
  return data
}


// Get all registered students
export async function getStudents() {
  const response = await fetch(`${BASE_URL}/students`)
  const data = await response.json()
  if (!response.ok) {
    throw new Error("Failed to load students")
  }
  return data.students
}


// Get attendance records, optionally filtered by subject and/or date
export async function getAttendance(subject, date) {
  let url = `${BASE_URL}/attendance?`
  if (subject) url += `subject=${encodeURIComponent(subject)}&`
  if (date) url += `date=${encodeURIComponent(date)}`

  const response = await fetch(url)
  const data = await response.json()
  if (!response.ok) {
    throw new Error("Failed to load attendance")
  }
  return data
}


// Get the list of subjects that have attendance data
export async function getSubjects() {
  const response = await fetch(`${BASE_URL}/subjects`)
  const data = await response.json()
  if (!response.ok) {
    throw new Error("Failed to load subjects")
  }
  return data.subjects
}


// Get attendance summary per student for a given subject (with percentage)
export async function getAttendanceSummary(subject) {
  const response = await fetch(`${BASE_URL}/attendance/summary?subject=${encodeURIComponent(subject)}`)
  const data = await response.json()
  if (!response.ok) {
    throw new Error("Failed to load summary")
  }
  return data  // returns { summary: [...], total_days: N }
}

// Get individual student attendance records for a subject
export async function getStudentAttendance(subject, studentId) {
  const response = await fetch(
    `${BASE_URL}/attendance/student?subject=${encodeURIComponent(subject)}&student_id=${encodeURIComponent(studentId)}`
  )
  const data = await response.json()
  if (!response.ok) {
    throw new Error("Failed to load student attendance")
  }
  return data.records
}
