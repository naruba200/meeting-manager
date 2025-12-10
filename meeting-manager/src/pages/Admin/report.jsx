import React, { useState, useEffect } from "react";
import reportService from "../../services/reportService";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell
} from "recharts";
import "../../assets/styles/report.css";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Static metrics & charts
const initialMetrics = {
  total: 0,
  completed: 0,
  ongoing: 0,
  scheduled: 0,
  avgDuration: 0,
  utilization: 0,
};

const COLORS = ["#0088FE", "#FF8042", "#00C49F"];

const Report = () => {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [physicalRooms, setPhysicalRooms] = useState([]);
  const [selectedRoomId, setSelectedRoomId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [filteredMeetings, setFilteredMeetings] = useState([]);
  const [displayMetrics, setDisplayMetrics] = useState(initialMetrics);
  const [meetingsOverTime, setMeetingsOverTime] = useState([]);
  const [meetingsByDept, setMeetingsByDept] = useState([]);

  const deptTotal = meetingsByDept.reduce((s, d) => s + (d.value || 0), 0);

  const [dateRange, setDateRange] = useState({
    startDate: new Date("2025-10-01T00:00:00"),
    endDate: new Date("2025-10-31T23:59:59"),
  });

  // ✅ Fetch meetings and metrics
  useEffect(() => {
    async function fetchData() {
      try {
        const allMeetings = await reportService.getAllMeetings();
        const meetingArray = Array.isArray(allMeetings)
          ? allMeetings
          : (allMeetings.data || allMeetings.meetings || []);
        setMeetings(meetingArray);

        const uniqueRooms = Array.from(
          new Map(
            meetingArray
              .filter(m => m.meetingRoom && m.meetingRoom.type === "PHYSICAL")
              .map(m => [m.meetingRoom.roomId, m.meetingRoom])
          ).values()
        );
        setPhysicalRooms(uniqueRooms);
        updateFilteredData(meetingArray, uniqueRooms);
      } catch (err) {
        console.error("Failed to fetch report data:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleClearFilter = () => {
    setSelectedRoomId("");
    setSearchTerm("");
    setSelectedStatus("");
    setDateRange({
      startDate: new Date("2025-10-01T00:00:00"),
      endDate: new Date("2025-10-31T23:59:59"),
    });

    updateFilteredData(meetings);
  };

  // Group meetings by department
  function getMeetingsByDepartment(meetings) {
    const map = new Map();
    meetings.forEach((m) => {
      const dept = m.organizerDepartment || m.department || "Unknown";
      map.set(dept, (map.get(dept) || 0) + 1);
    });
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }

  // Group meetings by date
  function getMeetingsOverTime(meetings) {
    const map = new Map();
    meetings.forEach((m) => {
      const start = new Date(m.startTime || m.start_time);
      if (isNaN(start)) return;
      if (start >= dateRange.startDate && start <= dateRange.endDate) {
        const date = start.toISOString().split("T")[0];
        map.set(date, (map.get(date) || 0) + 1);
      }
    });
    return Array.from(map.entries())
      .sort((a, b) => new Date(a[0]) - new Date(b[0]))
      .map(([date, count]) => ({ date, count }));
  }

  const updateFilteredData = (filtered, rooms = physicalRooms) => {
    setFilteredMeetings(filtered);
    const total = filtered.length;
    const completed = filtered.filter(m => m.status?.toLowerCase() === "completed" || m.status?.toLowerCase() === "complete").length;
    const ongoing = filtered.filter(m => m.status?.toLowerCase() === "ongoing").length;
    const scheduled = filtered.filter(m => m.status?.toLowerCase() === "scheduled").length;

    let totalMinutes = 0;
    filtered.forEach((m) => {
      const start = new Date(m.startTime || m.start_time);
      const end = new Date(m.endTime || m.end_time);
      if (!isNaN(start) && !isNaN(end)) totalMinutes += (end - start) / (1000 * 60);
    });
    const avgDuration = Math.round(filtered.length > 0 ? totalMinutes / filtered.length : 0);

    let totalMinutesBooked = 0;
    filtered.forEach((m) => {
      const start = new Date(m.startTime || m.start_time);
      const end = new Date(m.endTime || m.end_time);
      if (!isNaN(start) && !isNaN(end)) totalMinutesBooked += (end - start) / (1000 * 60);
    });

    const daysInRange = (dateRange.endDate - dateRange.startDate) / (1000 * 60 * 60 * 24) + 1;
    const totalAvailableMinutes = daysInRange * Math.max(rooms.length, 1) * 480;

    const utilization = totalAvailableMinutes > 0
      ? Math.round((totalMinutesBooked / totalAvailableMinutes) * 100)
      : 0;

    setDisplayMetrics({ total, completed, ongoing, scheduled, avgDuration, utilization });
    setMeetingsOverTime(getMeetingsOverTime(filtered));
    setMeetingsByDept(getMeetingsByDepartment(filtered));
  };

  const handleApplyFilter = () => {
    let filtered = [...meetings];
    if (selectedRoomId) {
      filtered = filtered.filter((m) => m.meetingRoom?.roomId === Number(selectedRoomId));
    }
    if (searchTerm.trim() !== "") {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (m) =>
          m.meetingRoom?.roomName?.toLowerCase().includes(term) ||
          m.organizer?.fullName?.toLowerCase().includes(term)
      );
    }
    if (selectedStatus) {
      filtered = filtered.filter((m) => m.status?.toUpperCase() === selectedStatus);
    }
    filtered = filtered.filter((m) => {
      const start = new Date(m.startTime || m.start_time);
      return start >= dateRange.startDate && start <= dateRange.endDate;
    });
    updateFilteredData(filtered);
  };

  const handleExportExcel = () => {
    const summaryData = [
      ["Metric", "Value"],
      ["Total Meetings", displayMetrics.total],
      ["Completed Meetings", displayMetrics.completed || 0],
      ["Average Duration (min)", displayMetrics.avgDuration],
      ["Room Utilization (%)", displayMetrics.utilization],
      [
        "Date Range",
        `${dateRange.startDate.toLocaleDateString()} - ${dateRange.endDate.toLocaleDateString()}`,
      ],
    ];
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    const overTimeData = [["Date", "Meeting Count"]];
    meetingsOverTime.forEach((m) => {
      overTimeData.push([m.date, m.count]);
    });
    const overTimeSheet = XLSX.utils.aoa_to_sheet(overTimeData);
    const meetingDetails = filteredMeetings.map((m) => ({
      "Meeting ID": m.meetingId,
      Title: m.title,
      Organizer: m.organizer?.fullName || "N/A",
      Room: m.meetingRoom?.roomName || "N/A",
      "Start Time": new Date(m.startTime).toLocaleString(),
      "End Time": new Date(m.endTime).toLocaleString(),
      Status: m.status,
    }));
    const detailsSheet = XLSX.utils.json_to_sheet(meetingDetails);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, summarySheet, "Summary");
    XLSX.utils.book_append_sheet(wb, overTimeSheet, "Over Time");
    XLSX.utils.book_append_sheet(wb, detailsSheet, "Meeting Details");
    XLSX.writeFile(wb, "Meeting_Usage_Report.xlsx");
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.setFont("helvetica", "normal");
    doc.setFontSize(16);
    doc.text("Meeting Room Usage Report", 14, 15);
    doc.setFontSize(11);
    doc.text(
      `Date range: ${dateRange.startDate.toLocaleDateString()} - ${dateRange.endDate.toLocaleDateString()}`,
      14,
      23
    );
    doc.setFontSize(12);
    doc.text("Summary Metrics:", 14, 33);
    const metricsY = 40;
    doc.text(`• Total meetings: ${displayMetrics.total}`, 20, metricsY);
    doc.text(`• Completed meetings: ${displayMetrics.completed || 0}`, 20, metricsY + 6);
    doc.text(`• Average duration: ${displayMetrics.avgDuration} min`, 20, metricsY + 18);
    doc.text(`• Room utilization: ${displayMetrics.utilization}%`, 20, metricsY + 24);
    const summaryOverTime = meetingsOverTime.map((m) => `${m.date}: ${m.count}`).join(", ");
    doc.text("Meetings Over Time:", 14, metricsY + 40);
    doc.setFontSize(10);
    doc.text(summaryOverTime || "No data available", 20, metricsY + 48, { maxWidth: 170 });
    autoTable(doc, {
      startY: metricsY + 70,
      head: [["Meeting ID", "Title", "Organizer", "Room", "Start Time", "End Time", "Status"]],
      body: filteredMeetings.map((m) => [
        m.meetingId,
        m.title,
        m.organizer?.fullName || "N/A",
        m.meetingRoom?.roomName || "N/A",
        new Date(m.startTime).toLocaleString(),
        new Date(m.endTime).toLocaleString(),
        m.status,
      ]),
      styles: { fontSize: 9 },
      headStyles: { fillColor: [52, 152, 219], textColor: 255 },
      theme: "striped",
    });
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(9);
      doc.text(`Page ${i} of ${pageCount}`, 180, 290, { align: "right" });
    }
    doc.save("Meeting_Usage_Report.pdf");
  };

  return (
    <div style={{ fontFamily: "sans-serif", padding: "20px" }}>
      {/* Header */}
      <header style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        paddingBottom: "10px", borderBottom: "1px solid #ddd"
      }}>
        <div>
          <h1 style={{ margin: 0 }}>Meeting Room Usage Report</h1>
        </div>
        <div>
          <button onClick={handleExportPDF} style={{ marginRight: "10px", padding: "6px 12px", background: "#e74c3c", color: "#fff", border: "none", borderRadius: "6px" }}>
            Export PDF
          </button>
          <button onClick={handleExportExcel} style={{ padding: "6px 12px", background: "#27ae60", color: "#fff", border: "none", borderRadius: "6px" }}>
            Export Excel
          </button>
        </div>
      </header>

      {/* Filters */}
      <section style={{ margin: "20px 0", padding: "10px", borderRadius: "8px" }}>
        <strong>Filters:</strong>
        <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
          <input type="text" placeholder="Search room or organizer" style={{ flex: 1, padding: "6px", border: "2px solid #E5E7EB", borderRadius: "6px" }} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          <select value={selectedRoomId} onChange={(e) => setSelectedRoomId(e.target.value)} style={{ border: "2px solid #E5E7EB", borderRadius: "6px" }}>
            <option value="">All Rooms</option>
            {Array.isArray(physicalRooms) &&
              physicalRooms.map((room) => (
                <option key={room.roomId} value={room.roomId}>
                  {room.roomName}
                </option>
              ))}
          </select>
          <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} style={{ border: "2px solid #E5E7EB", borderRadius: "6px" }}>
            <option value="">All Statuses</option>
            <option value="SCHEDULED">Scheduled</option>
            <option value="ONGOING">Ongoing</option>
            <option value="COMPLETED">Completed</option>
          </select>
          <input
            type="date"
            style={{ border: "2px solid #E5E7EB", borderRadius: "6px", padding: "6px", fontWeight: "500" }}
            value={new Date(dateRange.startDate.getTime() - (dateRange.startDate.getTimezoneOffset() * 60000)).toISOString().split("T")[0]}
            onChange={(e) =>
              setDateRange({
                ...dateRange,
                startDate: new Date(e.target.value + "T00:00:00"),
              })
            }
          />
          <input
            type="date"
            style={{ border: "2px solid #E5E7EB", borderRadius: "6px", padding: "6px", fontWeight: "500" }}
            value={new Date(dateRange.endDate.getTime() - (dateRange.endDate.getTimezoneOffset() * 60000)).toISOString().split("T")[0]}
            onChange={(e) =>
              setDateRange({
                ...dateRange,
                endDate: new Date(e.target.value + "T23:59:59"),
              })
            }
          />
          <button style={{ padding: "6px 12px", background: "#3498db", color: "#fff", borderRadius: "6px" }} onClick={handleApplyFilter}>
            Apply
          </button>
          <button style={{ padding: "6px 12px", background: "#aaa", color: "#fff", borderRadius: "6px" }} onClick={handleClearFilter}>
            Clear
          </button>
        </div>
      </section>

      {/* Metrics */}
      <section style={{ display: "flex", justifyContent: "space-around", marginBottom: "20px" }}>
        {Object.entries(displayMetrics).map(([k, v]) => (
          <div
            key={k}
            style={{
              background: "#fff",
              padding: "15px",
              borderRadius: "8px",
              flex: 1,
              margin: "0 5px",
              textAlign: "center",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
            }}
          >
            <h3 style={{ margin: 0 }}>{v}</h3>
            <p style={{ margin: 0, color: "#666" }}>{k}</p>
          </div>
        ))}
      </section>

      {/* Charts */}
      <section style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
        {/* Pie chart */}
        <div style={{ background: "#fff", borderRadius: "8px", padding: "20px" }}>
          <h4>Meetings by Department</h4>
          <ResponsiveContainer width="100%" height={320}>
            <PieChart margin={{ top: 30, right: 50, bottom: 30, left: 50 }}>
              <Pie
                data={meetingsByDept}
                dataKey="value"
                nameKey="name"
                label={({ name, percent }) => `${name}: ${Math.round(percent * 100)}%`}
                outerRadius={90}
              >
                {meetingsByDept.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#9B59B6"][index % 5]}
                  />
                ))}
              </Pie>
              <Legend verticalAlign="bottom" height={36} />
              <Tooltip
                formatter={(value, name) => {
                  const pct = deptTotal ? ((value / deptTotal) * 100).toFixed(1) : "0";
                  return [`${value} (${pct}%)`, name];
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Line chart */}
        <div style={{ background: "#fff", borderRadius: "8px", padding: "10px" }}>
          <h4>Meetings Over Time</h4>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={meetingsOverTime}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#8884d8" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Room Utilization */}
      <section style={{ marginBottom: "20px", background: "#fff", padding: "15px", borderRadius: "8px" }}>
        <h4>Room Utilization</h4>
        <div style={{ background: "#eee", borderRadius: "8px", overflow: "hidden" }}>
          <div
            style={{
              width: `${displayMetrics.utilization}%`,
              background: "#27ae60",
              padding: "8px 0",
              color: "#fff",
              textAlign: "center"
            }}
          >
            {displayMetrics.utilization}%
          </div>
        </div>
      </section>

      {/* Meetings Table */}
      <section style={{ background: "#fff", padding: "15px", borderRadius: "8px" }}>
        <h4>Meetings Table</h4>
        {loading ? (
          <p>Loading meetings...</p>
        ) : meetings.length === 0 ? (
          <p>No meetings found.</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f4f4f4" }}>
                <th style={{ padding: "8px", border: "1px solid #ddd" }}>Meeting ID</th>
                <th>Organizer</th>
                <th>Title</th>
                <th>Start Time</th>
                <th>End Time</th>
                <th>Room</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredMeetings.length > 0 ? (
                filteredMeetings.map((meeting) => (
                  <tr key={meeting.meetingId}>
                    <td>{meeting.meetingId}</td>
                    <td>{meeting.organizerName || "N/A"}</td>
                    <td>{meeting.title}</td>
                    <td>{new Date(meeting.startTime).toLocaleString()}</td>
                    <td>{new Date(meeting.endTime).toLocaleString()}</td>
                    <td>{meeting.roomName || "N/A"}</td>
                    <td>{meeting.status}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" style={{ textAlign: "center", color: "#888" }}>
                    No meetings found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </section>

      {/* Footer */}
      <footer style={{ marginTop: "20px", textAlign: "center", color: "#777" }}>
        <p>Total bookings: {displayMetrics.total} | Utilization rate: {displayMetrics.utilization}%</p>
      </footer>
    </div>
  );
};

export default Report;
