import { useState, useEffect } from "react"
import { getStudents } from "./api.js"

// This page shows a table of all students registered in the database.
// The teacher can use it to confirm a student was successfully registered.
export default function StudentsPage() {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  // Load students as soon as this page is opened
  useEffect(() => {
    async function loadStudents() {
      try {
        const list = await getStudents()
        setStudents(list)
      } catch (err) {
        setError("Failed to load students. Make sure the backend server is running.")
      } finally {
        setLoading(false)
      }
    }
    loadStudents()
  }, [])

  if (loading) {
    return <div className="loading">Loading students...</div>
  }

  return (
    <div className="card">
      <h2>Registered Students ({students.length})</h2>

      {error && <div className="message error">{error}</div>}

      {students.length === 0 && !error && (
        <p style={{ color: "#888", textAlign: "center", padding: "20px" }}>
          No students registered yet. Go to the Register tab to add students.
        </p>
      )}

      {students.length > 0 && (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Student ID</th>
                <th>Name</th>
                <th>Registered At</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student, index) => (
                <tr key={student.student_id}>
                  <td>{index + 1}</td>
                  <td>{student.student_id}</td>
                  <td>{student.name}</td>
                  <td>{student.registered_at}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
