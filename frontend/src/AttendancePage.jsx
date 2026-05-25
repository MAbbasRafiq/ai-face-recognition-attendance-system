import { useState } from "react"
import { startAttendance } from "./api.js"

// This page lets a teacher start a live attendance session.
// The teacher enters the subject name (e.g. "AI" or "DSA"),
// clicks the button, and the backend opens the webcam.
// The webcam stays open until the teacher presses Q.
export default function AttendancePage() {
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState(null)
  const [loading, setLoading] = useState(false)

  async function handleStartAttendance() {
    if (!subject.trim()) {
      setMessage({ text: "Please enter a subject name", type: "error" })
      return
    }

    setLoading(true)
    setMessage({
      text: `Starting attendance for "${subject}"... The camera window will open. Press Q when done.`,
      type: "info"
    })

    try {
      const result = await startAttendance(subject.trim())
      setMessage({ text: result.message, type: "success" })
    } catch (error) {
      setMessage({ text: error.message, type: "error" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card">
      <h2>Take Attendance</h2>

      <div className="form-group">
        <label>Subject Name</label>
        <input
          type="text"
          placeholder="e.g. AI or DSA"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        />
      </div>

      <button
        className="btn btn-primary"
        onClick={handleStartAttendance}
        disabled={loading}
      >
        {loading ? "Camera is running... (press Q to stop)" : "Start Attendance (Opens Camera)"}
      </button>

      <p style={{ marginTop: "12px", fontSize: "0.85rem", color: "#888" }}>
        Note: The camera window opens on the server machine. Press Q in that window to stop.
      </p>

      {message && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}
    </div>
  )
}
