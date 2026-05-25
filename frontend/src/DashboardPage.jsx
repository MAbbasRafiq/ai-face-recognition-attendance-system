import { useState, useEffect } from "react"
import {
  getSubjects,
  getAttendance,
  getAttendanceSummary,
  getStudentAttendance
} from "./api.js"

function getPercentageColor(pct) {
  if (pct >= 75) return "#16a34a"
  if (pct >= 50) return "#ca8a04"
  return "#dc2626"
}

function getBadgeStyle(pct) {
  if (pct >= 75) {
    return {
      background: "#dcfce7",
      color: "#166534",
      border: "1px solid #bbf7d0"
    }
  }

  if (pct >= 50) {
    return {
      background: "#fef9c3",
      color: "#854d0e",
      border: "1px solid #fef08a"
    }
  }

  return {
    background: "#fee2e2",
    color: "#991b1b",
    border: "1px solid #fecaca"
  }
}

// ---------------------------------------------
// Student Row
// ---------------------------------------------
function StudentRow({ item, subject, rank }) {
  const [expanded, setExpanded] = useState(false)
  const [detail, setDetail] = useState([])
  const [loadingDetail, setLoadingDetail] = useState(false)

  async function toggleExpand() {
    if (!expanded && detail.length === 0) {
      setLoadingDetail(true)

      try {
        const records = await getStudentAttendance(
          subject,
          item.student_id
        )

        setDetail(records)
      } catch {
        setDetail([])
      } finally {
        setLoadingDetail(false)
      }
    }

    setExpanded(prev => !prev)
  }

  const barWidth =
    item.total_days > 0
      ? (item.attended / item.total_days) * 100
      : 0

  return (
    <>
      <tr
        onClick={toggleExpand}
        style={{
          cursor: "pointer",
          transition: "background 0.2s ease"
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = "#eff6ff"
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = ""
        }}
      >
        <td
          style={{
            padding: "12px 16px",
            fontSize: "0.85rem",
            color: "#9ca3af",
            fontFamily: "monospace"
          }}
        >
          {rank}
        </td>

        <td
          style={{
            padding: "12px 16px",
            fontWeight: 600,
            color: "#1f2937"
          }}
        >
          {item.name}
        </td>

        <td
          style={{
            padding: "12px 16px",
            fontSize: "0.85rem",
            color: "#6b7280",
            fontFamily: "monospace"
          }}
        >
          {item.student_id}
        </td>

        <td style={{ padding: "12px 16px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px"
            }}
          >
            <div
              style={{
                flex: 1,
                background: "#f3f4f6",
                borderRadius: "999px",
                height: "10px",
                minWidth: "80px",
                overflow: "hidden"
              }}
            >
              <div
                style={{
                  width: `${barWidth}%`,
                  backgroundColor: getPercentageColor(item.percentage),
                  height: "100%",
                  borderRadius: "999px",
                  transition: "width 0.5s ease",
                  minWidth: barWidth > 0 ? "4px" : "0"
                }}
              />
            </div>

            <span
              style={{
                fontSize: "0.85rem",
                color: "#374151",
                width: "52px",
                textAlign: "right",
                flexShrink: 0
              }}
            >
              {item.attended}/{item.total_days}
            </span>
          </div>
        </td>

        <td
          style={{
            padding: "12px 16px",
            textAlign: "center"
          }}
        >
          <span
            style={{
              ...getBadgeStyle(item.percentage),
              display: "inline-block",
              fontSize: "0.75rem",
              fontWeight: 700,
              padding: "4px 10px",
              borderRadius: "999px"
            }}
          >
            {item.percentage}%
          </span>
        </td>

        <td
          style={{
            padding: "12px 16px",
            textAlign: "center",
            color: "#9ca3af",
            fontSize: "0.8rem",
            userSelect: "none"
          }}
        >
          {expanded ? "▲" : "▼"}
        </td>
      </tr>

      {expanded && (
        <tr>
          <td
            colSpan={6}
            style={{
              padding: "0 16px 12px 16px"
            }}
          >
            <div
              style={{
                borderRadius: "8px",
                border: "1px solid #e5e7eb",
                background: "#f9fafb",
                overflow: "hidden"
              }}
            >
              {loadingDetail ? (
                <p
                  style={{
                    fontSize: "0.85rem",
                    color: "#6b7280",
                    padding: "12px 16px"
                  }}
                >
                  Loading records…
                </p>
              ) : detail.length === 0 ? (
                <p
                  style={{
                    fontSize: "0.85rem",
                    color: "#6b7280",
                    padding: "12px 16px"
                  }}
                >
                  No attendance records found.
                </p>
              ) : (
                <table
                  style={{
                    width: "100%",
                    fontSize: "0.85rem",
                    borderCollapse: "collapse"
                  }}
                >
                  <thead>
                    <tr
                      style={{
                        background: "#e5e7eb",
                        color: "#4b5563"
                      }}
                    >
                      <th
                        style={{
                          padding: "8px 16px",
                          textAlign: "left",
                          fontWeight: 500
                        }}
                      >
                        #
                      </th>

                      <th
                        style={{
                          padding: "8px 16px",
                          textAlign: "left",
                          fontWeight: 500
                        }}
                      >
                        Date
                      </th>

                      <th
                        style={{
                          padding: "8px 16px",
                          textAlign: "left",
                          fontWeight: 500
                        }}
                      >
                        Time
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {detail.map((rec, i) => (
                      <tr
                        key={i}
                        style={{
                          borderTop: "1px solid #e5e7eb"
                        }}
                      >
                        <td
                          style={{
                            padding: "8px 16px",
                            color: "#9ca3af"
                          }}
                        >
                          {i + 1}
                        </td>

                        <td
                          style={{
                            padding: "8px 16px",
                            color: "#374151"
                          }}
                        >
                          {rec.date}
                        </td>

                        <td
                          style={{
                            padding: "8px 16px",
                            color: "#374151"
                          }}
                        >
                          {rec.time}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  )
}

// ---------------------------------------------
// Stat Card
// ---------------------------------------------
function StatCard({ value, label, bg }) {
  return (
    <div
      style={{
        flex: "1 1 130px",
        background: bg,
        color: "white",
        borderRadius: "12px",
        padding: "16px 20px",
        minWidth: "130px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.12)"
      }}
    >
      <div
        style={{
          fontSize: "2rem",
          fontWeight: 700,
          lineHeight: 1.1
        }}
      >
        {value}
      </div>

      <div
        style={{
          fontSize: "0.75rem",
          opacity: 0.8,
          marginTop: "6px"
        }}
      >
        {label}
      </div>
    </div>
  )
}

// ---------------------------------------------
// Dashboard
// ---------------------------------------------
export default function DashboardPage() {
  const [subjects, setSubjects] = useState([])
  const [selectedSubject, setSelectedSubject] = useState("")
  const [selectedDate, setSelectedDate] = useState("")
  const [records, setRecords] = useState([])
  const [summary, setSummary] = useState([])
  const [totalDays, setTotalDays] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [activeView, setActiveView] = useState("table")

  useEffect(() => {
    async function loadSubjects() {
      try {
        const list = await getSubjects()
        setSubjects(list)
      } catch {
        setError("Failed to load subjects")
      }
    }

    loadSubjects()
  }, [])

  async function handleSearch() {
    setLoading(true)
    setError("")

    try {
      const attendanceData = await getAttendance(
        selectedSubject,
        selectedDate
      )

      setRecords(attendanceData.records)

      if (selectedSubject) {
        const summaryData =
          await getAttendanceSummary(selectedSubject)

        setSummary(summaryData.summary)
        setTotalDays(summaryData.total_days)
      } else {
        setSummary([])
        setTotalDays(0)
      }
    } catch {
      setError("Failed to load attendance data")
    } finally {
      setLoading(false)
    }
  }

  const totalStudents = summary.length
  const presentToday = records.length

  const avgAttendance =
    summary.length > 0
      ? Math.round(
          summary.reduce(
            (acc, s) => acc + s.percentage,
            0
          ) / summary.length
        )
      : 0

  const atRisk =
    summary.filter(s => s.percentage < 75).length

  const showStats =
    records.length > 0 || summary.length > 0

  return (
    <div>
      {/* ---------------- Filter Card ---------------- */}
      <div className="card">
        <h2>Attendance Dashboard</h2>

        <div
          style={{
            display: "flex",
            gap: "16px",
            flexWrap: "wrap"
          }}
        >
          <div
            className="form-group"
            style={{
              flex: 1,
              minWidth: "160px"
            }}
          >
            <label>Subject</label>

            <select
              value={selectedSubject}
              onChange={e =>
                setSelectedSubject(e.target.value)
              }
            >
              <option value="">All Subjects</option>

              {subjects.map(subj => (
                <option key={subj} value={subj}>
                  {subj}
                </option>
              ))}
            </select>
          </div>

          <div
            className="form-group"
            style={{
              flex: 1,
              minWidth: "160px"
            }}
          >
            <label>Date</label>

            <input
              type="date"
              value={selectedDate}
              onChange={e =>
                setSelectedDate(e.target.value)
              }
            />
          </div>
        </div>

        <button
          className="btn btn-primary"
          onClick={handleSearch}
          disabled={loading}
        >
          {loading ? "Loading…" : "Search"}
        </button>

        {error && (
          <div className="message error">
            {error}
          </div>
        )}
      </div>

      {/* ---------------- Stats ---------------- */}
      {showStats && (
        <div
          style={{
            display: "flex",
            gap: "14px",
            flexWrap: "wrap",
            marginBottom: "20px"
          }}
        >
          <StatCard
            value={presentToday}
            label={
              selectedDate
                ? "Present on Date"
                : "Total Records"
            }
            bg="#1a1a2e"
          />

          {selectedSubject && (
            <>
              <StatCard
                value={totalDays}
                label="Total Class Days"
                bg="#2563eb"
              />

              <StatCard
                value={`${avgAttendance}%`}
                label="Avg Attendance"
                bg={getPercentageColor(avgAttendance)}
              />

              <StatCard
                value={atRisk}
                label="Students Below 75%"
                bg="#dc2626"
              />

              <StatCard
                value={totalStudents}
                label="Total Students"
                bg="#374151"
              />
            </>
          )}
        </div>
      )}

      {/* ---------------- Legend ---------------- */}
      {summary.length > 0 && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "20px",
            marginBottom: "14px",
            flexWrap: "wrap",
            fontSize: "0.8rem",
            color: "#4b5563"
          }}
        >
          <span
            style={{
              fontWeight: 600,
              color: "#374151"
            }}
          >
            Attendance legend:
          </span>

          <span
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px"
            }}
          >
            <span
              style={{
                width: "12px",
                height: "12px",
                borderRadius: "999px",
                background: "#16a34a"
              }}
            />
            ≥ 75% — Good
          </span>

          <span
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px"
            }}
          >
            <span
              style={{
                width: "12px",
                height: "12px",
                borderRadius: "999px",
                background: "#ca8a04"
              }}
            />
            50–74% — Warning
          </span>

          <span
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px"
            }}
          >
            <span
              style={{
                width: "12px",
                height: "12px",
                borderRadius: "999px",
                background: "#dc2626"
              }}
            />
            &lt; 50% — At Risk
          </span>
        </div>
      )}

      {/* ---------------- View Toggle ---------------- */}
      {summary.length > 0 && (
        <div
          style={{
            display: "flex",
            gap: "8px",
            marginBottom: "16px",
            flexWrap: "wrap"
          }}
        >
          <button
            onClick={() =>
              setActiveView("summary")
            }
            style={{
              padding: "10px 16px",
              borderRadius: "8px",
              border: "1px solid #d1d5db",
              background:
                activeView === "summary"
                  ? "#2563eb"
                  : "#ffffff",
              color:
                activeView === "summary"
                  ? "#ffffff"
                  : "#374151",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.2s ease"
            }}
          >
            Student Summary
          </button>

          <button
            onClick={() =>
              setActiveView("table")
            }
            style={{
              padding: "10px 16px",
              borderRadius: "8px",
              border: "1px solid #d1d5db",
              background:
                activeView === "table"
                  ? "#2563eb"
                  : "#ffffff",
              color:
                activeView === "table"
                  ? "#ffffff"
                  : "#374151",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.2s ease"
            }}
          >
            Attendance Log
          </button>
        </div>
      )}

      {/* ---------------- Summary View ---------------- */}
      {activeView === "summary" &&
        summary.length > 0 && (
          <div className="card">
            <h2>
              Student Attendance —{" "}
              {selectedSubject}
            </h2>

            <p
              style={{
                fontSize: "0.85rem",
                color: "#9ca3af",
                marginTop: "-12px",
                marginBottom: "16px"
              }}
            >
              Click any row to expand individual
              attendance dates.
            </p>

            <div
              className="table-wrapper"
              style={{
                overflowX: "auto"
              }}
            >
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  minWidth: "720px"
                }}
              >
                <thead>
                  <tr>
                    <th
                      style={{
                        padding: "12px 16px",
                        textAlign: "left"
                      }}
                    >
                      #
                    </th>

                    <th
                      style={{
                        padding: "12px 16px",
                        textAlign: "left"
                      }}
                    >
                      Name
                    </th>

                    <th
                      style={{
                        padding: "12px 16px",
                        textAlign: "left"
                      }}
                    >
                      Student ID
                    </th>

                    <th
                      style={{
                        padding: "12px 16px",
                        textAlign: "left"
                      }}
                    >
                      Progress
                    </th>

                    <th
                      style={{
                        padding: "12px 16px",
                        textAlign: "center"
                      }}
                    >
                      Attendance %
                    </th>

                    <th
                      style={{
                        padding: "12px 16px"
                      }}
                    />
                  </tr>
                </thead>

                <tbody>
                  {summary.map((item, index) => (
                    <StudentRow
                      key={item.student_id}
                      item={item}
                      subject={selectedSubject}
                      rank={index + 1}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      {/* ---------------- Attendance Log ---------------- */}
      {(activeView === "table" ||
        summary.length === 0) &&
        records.length > 0 && (
          <div className="card">
            <h2>Attendance Records</h2>

            <div
              className="table-wrapper"
              style={{
                overflowX: "auto"
              }}
            >
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  minWidth: "700px"
                }}
              >
                <thead>
                  <tr>
                    <th>Student ID</th>
                    <th>Name</th>
                    <th>Subject</th>
                    <th>Date</th>
                    <th>Time</th>
                  </tr>
                </thead>

                <tbody>
                  {records.map((record, index) => (
                    <tr key={index}>
                      <td>{record.student_id}</td>
                      <td>{record.name}</td>
                      <td>{record.subject}</td>
                      <td>{record.date}</td>
                      <td>{record.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      {/* ---------------- Empty State ---------------- */}
      {!loading &&
        records.length === 0 &&
        summary.length === 0 && (
          <div className="card">
            <p
              style={{
                color: "#9ca3af",
                textAlign: "center",
                padding: "20px"
              }}
            >
              No records found. Select a subject
              and click Search.
            </p>
          </div>
        )}
    </div>
  )
}

// import { useState, useEffect } from "react"
// import { getSubjects, getAttendance, getAttendanceSummary, getStudentAttendance } from "./api.js"

// // Returns Tailwind colour classes based on attendance percentage
// function getBadgeClasses(pct) {
//   if (pct >= 75) return "bg-green-100 text-green-800 border border-green-300"
//   if (pct >= 50) return "bg-yellow-100 text-yellow-800 border border-yellow-300"
//   return "bg-red-100 text-red-800 border border-red-300"
// }

// function getBarColor(pct) {
//   if (pct >= 75) return "#16a34a"   // green-600
//   if (pct >= 50) return "#ca8a04"   // yellow-600
//   return "#dc2626"                   // red-600
// }

// // Single student row with expandable detail
// function StudentRow({ item, subject, rank }) {
//   const [expanded, setExpanded] = useState(false)
//   const [detail, setDetail] = useState([])
//   const [loadingDetail, setLoadingDetail] = useState(false)

//   async function toggleExpand() {
//     if (!expanded && detail.length === 0) {
//       setLoadingDetail(true)
//       try {
//         const records = await getStudentAttendance(subject, item.student_id)
//         setDetail(records)
//       } catch {
//         setDetail([])
//       } finally {
//         setLoadingDetail(false)
//       }
//     }
//     setExpanded(prev => !prev)
//   }

//   const barWidth = item.total_days > 0 ? (item.attended / item.total_days) * 100 : 0

//   return (
//     <>
//       <tr
//         className="cursor-pointer hover:bg-blue-50 transition-colors"
//         onClick={toggleExpand}
//       >
//         <td className="px-4 py-3 text-sm text-gray-500 font-mono">{rank}</td>
//         <td className="px-4 py-3 font-semibold text-gray-800">{item.name}</td>
//         <td className="px-4 py-3 text-sm text-gray-600 font-mono">{item.student_id}</td>
//         <td className="px-4 py-3">
//           {/* Inline progress bar */}
//           <div className="flex items-center gap-2">
//             <div className="flex-1 bg-gray-100 rounded-full h-2.5 min-w-[80px]">
//               <div
//                 className="h-2.5 rounded-full transition-all duration-500"
//                 style={{ width: `${barWidth}%`, backgroundColor: getBarColor(item.percentage) }}
//               />
//             </div>
//             <span className="text-sm text-gray-700 w-16 text-right">
//               {item.attended}/{item.total_days}
//             </span>
//           </div>
//         </td>
//         <td className="px-4 py-3 text-center">
//           <span className={`inline-block text-xs font-bold px-2.5 py-1 rounded-full ${getBadgeClasses(item.percentage)}`}>
//             {item.percentage}%
//           </span>
//         </td>
//         <td className="px-4 py-3 text-center text-gray-400 text-sm select-none">
//           {expanded ? "▲" : "▼"}
//         </td>
//       </tr>

//       {/* Expanded detail rows */}
//       {expanded && (
//         <tr>
//           <td colSpan={6} className="px-0 pb-2">
//             <div className="mx-4 mb-2 rounded-lg border border-gray-200 bg-gray-50 overflow-hidden">
//               {loadingDetail ? (
//                 <p className="text-sm text-gray-500 px-4 py-3">Loading records…</p>
//               ) : detail.length === 0 ? (
//                 <p className="text-sm text-gray-500 px-4 py-3">No attendance records found.</p>
//               ) : (
//                 <table className="w-full text-sm">
//                   <thead>
//                     <tr className="bg-gray-200 text-gray-600">
//                       <th className="px-4 py-2 text-left font-medium">#</th>
//                       <th className="px-4 py-2 text-left font-medium">Date</th>
//                       <th className="px-4 py-2 text-left font-medium">Time</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {detail.map((rec, i) => (
//                       <tr key={i} className="border-t border-gray-200">
//                         <td className="px-4 py-2 text-gray-400">{i + 1}</td>
//                         <td className="px-4 py-2 text-gray-700">{rec.date}</td>
//                         <td className="px-4 py-2 text-gray-700">{rec.time}</td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               )}
//             </div>
//           </td>
//         </tr>
//       )}
//     </>
//   )
// }

// export default function DashboardPage() {
//   const [subjects, setSubjects] = useState([])
//   const [selectedSubject, setSelectedSubject] = useState("")
//   const [selectedDate, setSelectedDate] = useState("")
//   const [records, setRecords] = useState([])
//   const [summary, setSummary] = useState([])
//   const [totalDays, setTotalDays] = useState(0)
//   const [totalCount, setTotalCount] = useState(0)
//   const [loading, setLoading] = useState(false)
//   const [error, setError] = useState("")
//   const [activeView, setActiveView] = useState("table") // "table" | "summary"

//   useEffect(() => {
//     async function loadSubjects() {
//       try {
//         const list = await getSubjects()
//         setSubjects(list)
//       } catch {
//         setError("Failed to load subjects")
//       }
//     }
//     loadSubjects()
//   }, [])

//   async function handleSearch() {
//     setLoading(true)
//     setError("")
//     try {
//       const attendanceData = await getAttendance(selectedSubject, selectedDate)
//       setRecords(attendanceData.records)
//       setTotalCount(attendanceData.total)

//       if (selectedSubject) {
//         const summaryData = await getAttendanceSummary(selectedSubject)
//         setSummary(summaryData.summary)
//         setTotalDays(summaryData.total_days)
//       } else {
//         setSummary([])
//         setTotalDays(0)
//       }
//     } catch {
//       setError("Failed to load attendance data")
//     } finally {
//       setLoading(false)
//     }
//   }

//   // Derived stats from summary
//   const totalStudents = summary.length
//   const presentToday = records.length
//   const avgAttendance =
//     summary.length > 0
//       ? Math.round(summary.reduce((acc, s) => acc + s.percentage, 0) / summary.length)
//       : 0
//   const atRisk = summary.filter(s => s.percentage < 75).length

//   return (
//     <div>
//       {/* ---- Filter card ---- */}
//       <div className="card">
//         <h2>Attendance Dashboard</h2>
//         <div className="flex gap-4 flex-wrap">
//           <div className="form-group flex-1 min-w-[160px]">
//             <label>Subject</label>
//             <select value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)}>
//               <option value="">All Subjects</option>
//               {subjects.map(subj => (
//                 <option key={subj} value={subj}>{subj}</option>
//               ))}
//             </select>
//           </div>
//           <div className="form-group flex-1 min-w-[160px]">
//             <label>Date</label>
//             <input
//               type="date"
//               value={selectedDate}
//               onChange={e => setSelectedDate(e.target.value)}
//             />
//           </div>
//         </div>
//         <button className="btn btn-primary" onClick={handleSearch} disabled={loading}>
//           {loading ? "Loading…" : "Search"}
//         </button>
//         {error && <div className="message error">{error}</div>}
//       </div>

//       {/* ---- Stats cards ---- */}
//       {(records.length > 0 || summary.length > 0) && (
//         <div className="flex gap-4 flex-wrap mb-5">
//           {/* Present Today */}
//           <div className="flex-1 min-w-[130px] bg-[#1a1a2e] text-white rounded-xl px-6 py-4">
//             <div className="text-3xl font-bold">{presentToday}</div>
//             <div className="text-xs opacity-70 mt-1">
//               {selectedDate ? "Present on Date" : "Total Records"}
//             </div>
//           </div>

//           {selectedSubject && (
//             <>
//               {/* Total Class Days */}
//               <div className="flex-1 min-w-[130px] bg-blue-600 text-white rounded-xl px-6 py-4">
//                 <div className="text-3xl font-bold">{totalDays}</div>
//                 <div className="text-xs opacity-70 mt-1">Total Class Days</div>
//               </div>

//               {/* Avg Attendance % */}
//               <div
//                 className="flex-1 min-w-[130px] text-white rounded-xl px-6 py-4"
//                 style={{ backgroundColor: getBarColor(avgAttendance) }}
//               >
//                 <div className="text-3xl font-bold">{avgAttendance}%</div>
//                 <div className="text-xs opacity-70 mt-1">Avg Attendance</div>
//               </div>

//               {/* At Risk */}
//               <div className="flex-1 min-w-[130px] bg-red-600 text-white rounded-xl px-6 py-4">
//                 <div className="text-3xl font-bold">{atRisk}</div>
//                 <div className="text-xs opacity-70 mt-1">Students Below 75%</div>
//               </div>

//               {/* Total Students */}
//               <div className="flex-1 min-w-[130px] bg-gray-700 text-white rounded-xl px-6 py-4">
//                 <div className="text-3xl font-bold">{totalStudents}</div>
//                 <div className="text-xs opacity-70 mt-1">Total Students</div>
//               </div>
//             </>
//           )}
//         </div>
//       )}

//       {/* ---- Legend ---- */}
//       {summary.length > 0 && (
//         <div className="flex items-center gap-5 mb-4 text-xs text-gray-600 flex-wrap">
//           <span className="font-medium text-gray-700">Attendance legend:</span>
//           <span className="flex items-center gap-1.5">
//             <span className="inline-block w-3 h-3 rounded-full bg-green-500"></span> ≥ 75% — Good
//           </span>
//           <span className="flex items-center gap-1.5">
//             <span className="inline-block w-3 h-3 rounded-full bg-yellow-500"></span> 50–74% — Warning
//           </span>
//           <span className="flex items-center gap-1.5">
//             <span className="inline-block w-3 h-3 rounded-full bg-red-500"></span> &lt; 50% — At Risk
//           </span>
//         </div>
//       )}

//       {/* ---- View toggle (only when subject selected and summary loaded) ---- */}
//       {summary.length > 0 && (
//         <div className="flex gap-2 mb-4">
//           <button
//             className={`tab-button ${activeView === "summary" ? "active" : ""}`}
//             onClick={() => setActiveView("summary")}
//           >
//             Student Summary
//           </button>
//           <button
//             className={`tab-button ${activeView === "table" ? "active" : ""}`}
//             onClick={() => setActiveView("table")}
//           >
//             Attendance Log
//           </button>
//         </div>
//       )}

//       {/* ---- Student Summary view ---- */}
//       {activeView === "summary" && summary.length > 0 && (
//         <div className="card">
//           <h2>Student Attendance — {selectedSubject}</h2>
//           <p className="text-sm text-gray-500 -mt-2 mb-4">
//             Click any row to expand individual attendance dates.
//           </p>
//           <div className="table-wrapper">
//             <table>
//               <thead>
//                 <tr>
//                   <th className="px-4 py-3 text-left">#</th>
//                   <th className="px-4 py-3 text-left">Name</th>
//                   <th className="px-4 py-3 text-left">Student ID</th>
//                   <th className="px-4 py-3 text-left">Progress</th>
//                   <th className="px-4 py-3 text-center">Attendance %</th>
//                   <th className="px-4 py-3 text-center"></th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {summary.map((item, index) => (
//                   <StudentRow
//                     key={item.student_id}
//                     item={item}
//                     subject={selectedSubject}
//                     rank={index + 1}
//                   />
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       )}

//       {/* ---- Attendance Log view ---- */}
//       {(activeView === "table" || summary.length === 0) && records.length > 0 && (
//         <div className="card">
//           <h2>Attendance Records</h2>
//           <div className="table-wrapper">
//             <table>
//               <thead>
//                 <tr>
//                   <th>Student ID</th>
//                   <th>Name</th>
//                   <th>Subject</th>
//                   <th>Date</th>
//                   <th>Time</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {records.map((record, index) => (
//                   <tr key={index}>
//                     <td>{record.student_id}</td>
//                     <td>{record.name}</td>
//                     <td>{record.subject}</td>
//                     <td>{record.date}</td>
//                     <td>{record.time}</td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       )}

//       {/* ---- Empty state ---- */}
//       {!loading && records.length === 0 && summary.length === 0 && (
//         <div className="card">
//           <p className="text-gray-400 text-center py-5">
//             No records found. Select a subject and click Search.
//           </p>
//         </div>
//       )}
//     </div>
//   )
// }
