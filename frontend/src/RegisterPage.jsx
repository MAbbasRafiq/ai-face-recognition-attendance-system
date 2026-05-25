import { useState } from "react"
import { registerStudent, generateEncodings } from "./api.js"

// This page lets a teacher register a new student.
// Step 1: Enter the student's ID and name, then click "Register Face"
//         → backend opens the webcam and captures 25 photos
// Step 2: Click "Generate Encodings" after registering all students
//         → backend creates face embeddings used for recognition
export default function RegisterPage() {
  const [studentId, setStudentId] = useState("")
  const [name, setName] = useState("")
  const [message, setMessage] = useState(null)   // { text, type } where type is "success" | "error" | "info"
  const [loading, setLoading] = useState(false)

  async function handleRegister() {
    // Validate that both fields are filled in
    if (!studentId.trim() || !name.trim()) {
      setMessage({ text: "Please enter both Student ID and Name", type: "error" })
      return
    }

    setLoading(true)
    setMessage({ text: "Opening camera... look at the camera and wait for 25 photos to be taken.", type: "info" })

    try {
      const result = await registerStudent(studentId.trim(), name.trim())
      setMessage({ text: result.message, type: "success" })
      // Clear the form after successful registration
      setStudentId("")
      setName("")
    } catch (error) {
      setMessage({ text: error.message, type: "error" })
    } finally {
      setLoading(false)
    }
  }

  async function handleGenerateEncodings() {
    setLoading(true)
    setMessage({ text: "Generating encodings... this may take a minute.", type: "info" })

    try {
      const result = await generateEncodings()
      setMessage({ text: result.message, type: "success" })
    } catch (error) {
      setMessage({ text: error.message, type: "error" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card">
      <h2>Register New Student</h2>

      <div className="form-group">
        <label>Student ID</label>
        <input
          type="text"
          placeholder="e.g. 40"
          value={studentId}
          onChange={(e) => setStudentId(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label>Student Name</label>
        <input
          type="text"
          placeholder="e.g. Ali"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <button
        className="btn btn-primary"
        onClick={handleRegister}
        disabled={loading}
      >
        {loading ? "Please wait..." : "Register Face (Opens Camera)"}
      </button>

      <hr className="divider" />

      <p style={{ marginBottom: "12px", color: "#666", fontSize: "0.9rem" }}>
        After registering all students, click below to generate face encodings.
        You only need to do this once (or after adding new students).
      </p>

      <button
        className="btn btn-secondary"
        onClick={handleGenerateEncodings}
        disabled={loading}
      >
        {loading ? "Please wait..." : "Generate Face Encodings"}
      </button>

      {/* Show success/error/info message */}
      {message && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}
    </div>
  )
}
