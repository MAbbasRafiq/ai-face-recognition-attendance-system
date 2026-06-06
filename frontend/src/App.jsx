import { useState } from "react"
import RegisterPage from "./RegisterPage.jsx"
import AttendancePage from "./AttendancePage.jsx"
import DashboardPage from "./DashboardPage.jsx"
import StudentsPage from "./StudentsPage.jsx"

const TABS = [
  { id: "register", label: "Register", hint: "Add faces" },
  { id: "attendance", label: "Attendance", hint: "Live session" },
  { id: "dashboard", label: "Dashboard", hint: "Insights" },
  { id: "students", label: "Students", hint: "Directory" },
]

export default function App() {
  const [activeTab, setActiveTab] = useState("register")

  function renderPage() {
    if (activeTab === "register")   return <RegisterPage />
    if (activeTab === "attendance") return <AttendancePage />
    if (activeTab === "dashboard")  return <DashboardPage />
    if (activeTab === "students")   return <StudentsPage />
  }

  return (
    <div className="app-shell">
      <header className="navbar">
        <div className="brand-mark">AI</div>
        <div>
          <p className="eyebrow">Face Recognition Attendance</p>
          <h1>AI Attendance System</h1>
        </div>
      </header>

      <main className="container">
        <section className="workspace-hero">
          <div>
            <p className="eyebrow">Teacher Console</p>
            <h2>Manage registration, live attendance, and class insights.</h2>
          </div>
          <div className="hero-status">
            <span className="status-dot" />
            Local backend connected workflow
          </div>
        </section>

        <nav className="tabs" aria-label="Main sections">
          {TABS.map((tab, index) => (
            <button
              key={tab.id}
              className={`tab-button ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
              type="button"
            >
              <span className="tab-index">{index + 1}</span>
              <span>
                <strong>{tab.label}</strong>
                <small>{tab.hint}</small>
              </span>
            </button>
          ))}
        </nav>

        <section className="page-panel">{renderPage()}</section>
      </main>
    </div>
  )
}
