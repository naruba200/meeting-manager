import React from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell
} from "recharts";
import "../assets/styles/report.css";

// Mock data
const metrics = {
  total: 63,
  completed: 50,
  cancelled: 7,
  rescheduled: 6,
  onTime: "89%",
  avgDuration: 49,
  utilization: 87,
};

const meetingsOverTime = [
  { date: "Aug 2", count: 2 },
  { date: "Aug 8", count: 3 },
  { date: "Aug 16", count: 3 },
  { date: "Aug 20", count: 4 },
  { date: "Aug 25", count: 5 },
  { date: "Aug 30", count: 4 },
];

const meetingsByDept = [
  { name: "Marketing", value: 20 },
  { name: "Sales", value: 18 },
  { name: "Engineering", value: 25 },
];

const COLORS = ["#0088FE", "#FF8042", "#00C49F"];

const meetings = [
  { id: 1, name: "Marketing Strategy", organizer: "Ema Smon", participants: 2, time: "1:00 – 3:00", duration: "2h", room: "Outcome N", status: "Completed" },
  { id: 2, name: "Project Kickoff", organizer: "Robert Wim", participants: 3, time: "10:00 – 11:00", duration: "1h", room: "House 1", status: "Cancelled" },
  { id: 3, name: "Client Call", organizer: "Carle Mey", participants: 9, time: "10:00 – 11:20", duration: "1h20", room: "Outcome C", status: "Completed" },
];

const TKE = () => {
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
          <button style={{ marginRight: "10px", padding: "6px 12px", background: "#e74c3c", color: "#fff", border: "none", borderRadius: "6px" }}>Xuất PDF</button>
          <button style={{ marginRight: "10px", padding: "6px 12px", background: "#27ae60", color: "#fff", border: "none", borderRadius: "6px" }}>Xuất Excel</button>
          <span>15/10/2023</span>
        </div>
      </header>

      {/* Filters */}
      <section style={{ margin: "20px 0", padding: "10px", background: "#f9f9f9", borderRadius: "8px" }}>
        <strong>Bộ lọc:</strong>
        <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
          <input type="text" placeholder="Tìm kiếm phòng hoặc người" style={{ flex: 1, padding: "6px" }} />
          <select><option>Tất cả phòng</option><option>Phòng A</option></select>
          <select><option>Tất cả trạng thái</option><option>Đã đặt</option><option>Hủy</option></select>
          <button style={{ padding: "6px 12px", background: "#3498db", color: "#fff", border: "none", borderRadius: "6px" }}>Áp dụng</button>
          <button style={{ padding: "6px 12px", background: "#aaa", color: "#fff", border: "none", borderRadius: "6px" }}>Xóa</button>
        </div>
      </section>

      {/* Metrics */}
      <section style={{ display: "flex", justifyContent: "space-around", marginBottom: "20px" }}>
        {Object.entries(metrics).map(([k, v]) => (
          <div key={k} style={{ background: "#fff", padding: "15px", borderRadius: "8px", flex: 1, margin: "0 5px", textAlign: "center", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
            <h3 style={{ margin: 0 }}>{v}</h3>
            <p style={{ margin: 0, color: "#666" }}>{k}</p>
          </div>
        ))}
      </section>

      {/* Charts */}
      <section style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
        {/* Pie chart */}
        <div style={{ background: "#fff", borderRadius: "8px", padding: "10px" }}>
          <h4>Meetings by Department</h4>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={meetingsByDept} dataKey="value" nameKey="name" label>
                {meetingsByDept.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Legend />
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
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#8884d8" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Room Utilization */}
      <section style={{ marginBottom: "20px", background: "#fff", padding: "15px", borderRadius: "8px" }}>
        <h4>Room Utilization</h4>
        <div style={{ background: "#eee", borderRadius: "8px", overflow: "hidden" }}>
          <div style={{ width: `${metrics.utilization}%`, background: "#27ae60", padding: "8px 0", color: "#fff", textAlign: "center" }}>
            {metrics.utilization}%
          </div>
        </div>
      </section>

      {/* Table */}
      <section style={{ background: "#fff", padding: "15px", borderRadius: "8px" }}>
        <h4>Meetings Table</h4>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f4f4f4" }}>
              <th style={{ padding: "8px", border: "1px solid #ddd" }}>Meeting</th>
              <th>Organizer</th>
              <th>Participants</th>
              <th>Time</th>
              <th>Duration</th>
              <th>Room</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {meetings.map(m => (
              <tr key={m.id}>
                <td style={{ border: "1px solid #ddd", padding: "6px" }}>{m.name}</td>
                <td>{m.organizer}</td>
                <td>{m.participants}</td>
                <td>{m.time}</td>
                <td>{m.duration}</td>
                <td>{m.room}</td>
                <td style={{ color: m.status === "Completed" ? "green" : "red" }}>{m.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Footer */}
      <footer style={{ marginTop: "20px", textAlign: "center", color: "#777" }}>
        <p>Tổng số đặt phòng: {metrics.total} | Tỷ lệ sử dụng: {metrics.utilization}%</p>        
      </footer>
    </div>
  );
};

export default TKE;
