import { useState } from "react"
import RegisterPage from "./RegisterPage.jsx"
import AttendancePage from "./AttendancePage.jsx"
import DashboardPage from "./DashboardPage.jsx"
import StudentsPage from "./StudentsPage.jsx"

// The four tabs the teacher can switch between
const TABS = [
  { id: "register",   label: "Register Student" },
  { id: "attendance", label: "Take Attendance"  },
  { id: "dashboard",  label: "Dashboard"        },
  { id: "students",   label: "All Students"     },
]

export default function App() {
  // Track which tab is currently visible
  const [activeTab, setActiveTab] = useState("register")

  // Decide which page component to render based on the active tab
  function renderPage() {
    if (activeTab === "register")   return <RegisterPage />
    if (activeTab === "attendance") return <AttendancePage />
    if (activeTab === "dashboard")  return <DashboardPage />
    if (activeTab === "students")   return <StudentsPage />
  }

  return (
    <div>
      {/* Top bar */}
      <div className="navbar">
        <h1>AI Attendance System</h1>
      </div>

      {/* Page content */}
      <div className="container">

        {/* Tab buttons */}
        <div className="tabs">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              className={`tab-button ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Active page */}
        {renderPage()}

      </div>
    </div>
  )
}
