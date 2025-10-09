import React, { useState, useEffect } from "react";
import reportService from "../../services/reportService";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell
} from "recharts";
import "../../assets/styles/report.css";

// Static metrics & charts
const metrics = {
  total: 0,
  completed: 50,
  cancelled: 0,
  rescheduled: 6,
  onTime: "89%",
  avgDuration: 0, 
  utilization: 87,
};

const COLORS = ["#0088FE", "#FF8042", "#00C49F"];

const Report = () => {
  const [totalMeetings, setTotalMeetings] = useState(metrics.total);
  const [cancelledMeetings, setCancelledMeetings] = useState(metrics.cancelled);
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [physicalRooms, setPhysicalRooms] = useState([]);
  const [avgDuration, setAvgDuration] = useState(metrics.avgDuration);
  const [meetingsOverTime, setMeetingsOverTime] = useState([]);
  const [meetingsByDept, setMeetingsByDept] = useState([]);
  const [filteredMeetings, setFilteredMeetings] = useState([]);
  const [dateRange, setDateRange] = useState({
    startDate: new Date("2025-10-01T00:00:00"),
    endDate: new Date("2025-10-31T23:59:59"),
  });

  // ✅ Fetch meetings and metrics
  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch all meetings
        const allMeetings = await reportService.getAllMeetings();
        console.log("✅ /api/meetings response:", allMeetings);
        // Ensure response is an array
        const meetingArray = Array.isArray(allMeetings)
          ? allMeetings
          : (allMeetings.data || allMeetings.meetings || []);

        setMeetings(meetingArray);
        setTotalMeetings(meetingArray.length);
        setMeetingsOverTime(getMeetingsOverTime(meetingArray));
        setMeetingsByDept(getMeetingsByDepartment(meetingArray));
        setFilteredMeetings(meetingArray);

        // --- Compute average duration dynamically ---
        let totalMinutes = 0;
        meetingArray.forEach((m) => {
          const start = new Date(m.startTime || m.start_time);
          const end = new Date(m.endTime || m.end_time);
          if (!isNaN(start) && !isNaN(end)) {
            const diff = (end - start) / (1000 * 60); // minutes
            totalMinutes += diff;
          }
        });
        const avg = meetingArray.length > 0 ? totalMinutes / meetingArray.length : 0;
        setAvgDuration(Math.round(avg));

        // --- Extract unique physical rooms from meeting data ---
        const uniqueRooms = Array.from(
          new Map(
            meetingArray
              .filter(m => m.meetingRoom && m.meetingRoom.type === "PHYSICAL")
              .map(m => [m.meetingRoom.roomId, m.meetingRoom])
          ).values()
        );
        setPhysicalRooms(uniqueRooms);
        console.log("setPhysicalRooms called with:", uniqueRooms);

        // Fetch cancelled meetings
        const cancelledTotal = await reportService.getCancelledMeetingsTotal(
          dateRange.startDate,
          dateRange.endDate
        );
        setCancelledMeetings(cancelledTotal);
      } catch (err) {
        console.error("Failed to fetch report data:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [dateRange.startDate, dateRange.endDate]);

  const updatedMetrics = { 
  ...metrics, 
  total: totalMeetings, 
  cancelled: cancelledMeetings, 
  avgDuration: avgDuration 
  };

  // Group meetings by organizer department
    function getMeetingsByDepartment(meetings) {
      const map = new Map();

      meetings.forEach((m) => {
        const dept =
          (m.organizer && m.organizer.department) ||
          m.department ||
          "Unknown";
        map.set(dept, (map.get(dept) || 0) + 1);
      });

      return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
    }


  // Group meetings by date (YYYY-MM-DD)
    function getMeetingsOverTime(meetings) {
      const map = new Map();

      meetings.forEach((m) => {
        const start = new Date(m.startTime || m.start_time);
        if (isNaN(start)) return;

        const date = start.toISOString().split("T")[0]; // e.g. "2025-10-10"
        map.set(date, (map.get(date) || 0) + 1);
      });

      // Convert to array sorted by date
      return Array.from(map.entries())
        .sort((a, b) => new Date(a[0]) - new Date(b[0]))
        .map(([date, count]) => ({
          date,
          count,
        }));
    }

        const handleApplyFilter = () => {
      if (!physicalRooms) {
        setFilteredMeetings(meetings);
      } else {
        const filtered = meetings.filter(
          (m) => m.meetingRoom?.roomId === Number(physicalRooms)
        );
        setFilteredMeetings(filtered);
      }
    };

  return (
    <div style={{ fontFamily: "sans-serif", padding: "20px" }}>
      {/* Header */}
      <header style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        paddingBottom: "10px", borderBottom: "1px solid #ddd"
      }}>
        <div>
          <h1 style={{ margin: 0 }}>Báo Cáo Sử Dụng Phòng Họp</h1>
          <p style={{ color: "#888" }}>Trang chủ &gt; Báo cáo</p>
        </div>
        <div>
          <button style={{ marginRight: "10px", padding: "6px 12px", background: "#e74c3c", color: "#fff", border: "none", borderRadius: "6px" }}>
            Xuất PDF
          </button>
          <button style={{ marginRight: "10px", padding: "6px 12px", background: "#27ae60", color: "#fff", border: "none", borderRadius: "6px" }}>
            Xuất Excel
          </button>
          <span>15/10/2023</span>
        </div>
      </header>

      {/* Filters */}
      <section style={{ margin: "20px 0", padding: "10px", background: "#f9f9f9", borderRadius: "8px" }}>
        <strong>Bộ lọc:</strong>
        <div style={{ display: "flex", gap: "10px", marginTop: "10px"}}>
          <input type="text" placeholder="Tìm kiếm phòng hoặc người" style={{ flex: 1, padding: "6px" }} />
          <select onChange={(e) => setPhysicalRooms(Number(e.target.value))}>
            <option value="">Tất cả phòng</option>
            {Array.isArray(physicalRooms) &&
              physicalRooms.map((room) => (
                <option key={room.roomId} value={room.roomId}>
                  {room.roomName}
                </option>
              ))}
          </select>
          <select>
            <option>Tất cả trạng thái</option>
            <option>Đã đặt</option>
            <option>Hủy</option>
          </select>
          <button style={{ padding: "6px 12px", background: "#3498db", color: "#fff", border: "none", borderRadius: "6px" }} onClick={handleApplyFilter}>
            Áp dụng
          </button>
          <button style={{ padding: "6px 12px", background: "#aaa", color: "#fff", border: "none", borderRadius: "6px" }}>
            Xóa
          </button>
        </div>
      </section>

      {/* Metrics */}
      <section style={{ display: "flex", justifyContent: "space-around", marginBottom: "20px" }}>
        {Object.entries(updatedMetrics).map(([k, v]) => (
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
          <ResponsiveContainer width="100%" height={280}>
            <PieChart margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
              <Pie
                data={meetingsByDept}
                dataKey="value"
                nameKey="name"
                label
                outerRadius={90} // slightly smaller so it doesn't touch the border
              >
                {meetingsByDept.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#9B59B6"][index % 5]}
                  />
                ))}
              </Pie>
              <Legend verticalAlign="bottom" height={36} />
              <Tooltip />
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
              width: `${updatedMetrics.utilization}%`,
              background: "#27ae60",
              padding: "8px 0",
              color: "#fff",
              textAlign: "center"
            }}
          >
            {updatedMetrics.utilization}%
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

                <th style={{ padding: "8px", border: "1px solid #ddd" }}>MeetingID</th>
                <th>Organizer</th>
                <th>Meeting</th>
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
                    <td>{meeting.organizer?.fullName || "N/A"}</td>
                    <td>{meeting.title}</td>
                    <td>{new Date(meeting.startTime).toLocaleString()}</td>
                    <td>{new Date(meeting.endTime).toLocaleString()}</td>
                    <td>{meeting.meetingRoom?.roomName || "N/A"}</td>
                    <td>{meeting.status}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center", color: "#888" }}>
                    Không có cuộc họp nào
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </section>

      {/* Footer */}
      <footer style={{ marginTop: "20px", textAlign: "center", color: "#777" }}>
        <p>Tổng số đặt phòng: {updatedMetrics.total} | Tỷ lệ sử dụng: {updatedMetrics.utilization}%</p>
      </footer>
    </div>
  );
};

export default Report;
