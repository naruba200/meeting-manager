import React, { useState, useEffect } from "react";
import reportService from "../../services/reportService";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell
} from "recharts";
import "../../assets/styles/report.css";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from"jspdf-autotable";


// Static metrics & charts
const metrics = {
  total: 0,
  completed: 0,
  cancelled: 0,
  avgDuration: 0, 
  utilization: 0,
};

const COLORS = ["#0088FE", "#FF8042", "#00C49F"];

const Report = () => {
  const [totalMeetings, setTotalMeetings] = useState(metrics.total);
  const [cancelledMeetings, setCancelledMeetings] = useState(metrics.cancelled);
  const [utilization, setUtilization] = useState(metrics.utilization);
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [physicalRooms, setPhysicalRooms] = useState([]);
  const [selectedRoomId, setSelectedRoomId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
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
        // --- Compute utilization dynamically ---
        let totalMinutesBooked = 0;
        meetingArray.forEach((m) => {
          const start = new Date(m.startTime || m.start_time);
          const end = new Date(m.endTime || m.end_time);
          if (!isNaN(start) && !isNaN(end)) {
            totalMinutesBooked += (end - start) / (1000 * 60); // minutes
          }
        });

        const daysInRange =
          (dateRange.endDate - dateRange.startDate) / (1000 * 60 * 60 * 24) + 1;

        const totalAvailableMinutes =
          daysInRange * Math.max(physicalRooms.length, 1) * 480; // avoid divide by 0

        const utilizationPercent =
          totalAvailableMinutes > 0
            ? Math.round((totalMinutesBooked / totalAvailableMinutes) * 100)
            : 0;
                setMeetings(meetingArray);

        setUtilization(utilizationPercent);
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

  const handleClearFilter = () => {
  setSelectedRoomId("");      
  setFilteredMeetings(meetings); 
  setSearchTerm("");
  setSelectedStatus("");
  };

  const updatedMetrics = { 
  ...metrics, 
  total: totalMeetings,
  completed: meetings.filter(
    (m) => m.status?.toLowerCase() === "completed" || m.status?.toLowerCase() === "complete"
  ).length, 
  cancelled: cancelledMeetings, 
  avgDuration: avgDuration,
  utilization: utilization
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

        // 🔽 Lọc theo dateRange
        if (start >= dateRange.startDate && start <= dateRange.endDate) {
          const date = start.toISOString().split("T")[0];
          map.set(date, (map.get(date) || 0) + 1);
        }
      });

      return Array.from(map.entries())
        .sort((a, b) => new Date(a[0]) - new Date(b[0]))
        .map(([date, count]) => ({ date, count }));
    }


      const handleApplyFilter = () => {
        let filtered = [...meetings];

        if (selectedRoomId) {
          filtered = filtered.filter(
            (m) => m.meetingRoom?.roomId === Number(selectedRoomId)
          );
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
          filtered = filtered.filter(
            (m) => m.status?.toUpperCase() === selectedStatus
          );
        }

        setFilteredMeetings(filtered);
      };
    
   const handleExportExcel = () => {
      // === 1. Summary Sheet ===
      const summaryData = [
        ["Metric", "Value"],
        ["Total Meetings", updatedMetrics.total],
        ["Completed Meetings", updatedMetrics.completed || 0],
        ["Cancelled Meetings", updatedMetrics.cancelled],
        ["Average Duration (min)", updatedMetrics.avgDuration],
        ["Room Utilization (%)", updatedMetrics.utilization],
        [
          "Date Range",
          `${dateRange.startDate.toLocaleDateString()} - ${dateRange.endDate.toLocaleDateString()}`,
        ],
      ];
      const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);

      // === 2. Meetings Over Time Sheet ===
      const overTimeData = [["Date", "Meeting Count"]];
      meetingsOverTime.forEach((m) => {
        overTimeData.push([m.date, m.count]);
      });
      const overTimeSheet = XLSX.utils.aoa_to_sheet(overTimeData);

      // === 3. Meeting Details Sheet ===
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

      // === 4. Create workbook ===
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, summarySheet, "Summary");
      XLSX.utils.book_append_sheet(wb, overTimeSheet, "Over Time");
      XLSX.utils.book_append_sheet(wb, detailsSheet, "Meeting Details");

      // === 5. Export ===
      XLSX.writeFile(wb, "Meeting_Usage_Report.xlsx");
    };


    const handleExportPDF = () => {
      const doc = new jsPDF();
      doc.setFont("helvetica", "normal");

      // --- TITLE ---
      doc.setFontSize(16);
      doc.text("Meeting Room Usage Report", 14, 15);
      doc.setFontSize(11);
      doc.text(
        `Date range: ${dateRange.startDate.toLocaleDateString()} - ${dateRange.endDate.toLocaleDateString()}`,
        14,
        23
      );

      // --- SUMMARY METRICS ---
      doc.setFontSize(12);
      doc.text("Summary Metrics:", 14, 33);
      const metricsY = 40;
      doc.text(`• Total meetings: ${updatedMetrics.total}`, 20, metricsY);
      doc.text(`• Completed meetings: ${updatedMetrics.completed || 0}`, 20, metricsY + 6);
      doc.text(`• Cancelled meetings: ${updatedMetrics.cancelled}`, 20, metricsY + 12);
      doc.text(`• Average duration: ${updatedMetrics.avgDuration} min`, 20, metricsY + 18);
      doc.text(`• Room utilization: ${updatedMetrics.utilization}%`, 20, metricsY + 24);

      // --- MEETINGS OVER TIME (AGGREGATE) ---
      const summaryOverTime = meetingsOverTime.map((m) => `${m.date}: ${m.count}`).join(", ");
      doc.text("Meetings Over Time:", 14, metricsY + 40);
      doc.setFontSize(10);
      doc.text(summaryOverTime || "No data available", 20, metricsY + 48, { maxWidth: 170 });

      // --- MEETING DETAILS TABLE ---
      const tableStartY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 10 : metricsY + 100;

      autoTable(doc, {
        startY: tableStartY,
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

      // --- FOOTER (PAGE NUMBERS) ---
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
          <h1 style={{ margin: 0 }}>Báo Cáo Sử Dụng Phòng Họp</h1>
          <p style={{ color: "#888" }}>Trang chủ &gt; Báo cáo</p>
        </div>
        <div>
          <button onClick={handleExportPDF} style={{ marginRight: "10px", padding: "6px 12px", background: "#e74c3c", color: "#fff", border: "none", borderRadius: "6px" }}>
            Xuất PDF
          </button>
          <button onClick={handleExportExcel} style={{ marginRight: "10px", padding: "6px 12px", background: "#27ae60", color: "#fff", border: "none", borderRadius: "6px" }}>
            Xuất Excel
          </button>
          <span>15/10/2023</span>
        </div>
      </header>

      {/* Filters */}
      <section style={{ margin: "20px 0", padding: "10px", background: "#f9f9f9", borderRadius: "8px" }}>
        <strong>Bộ lọc:</strong>
        <div style={{ display: "flex", gap: "10px", marginTop: "10px"}}>
          <input type="text" placeholder="Tìm kiếm phòng hoặc người" style={{ flex: 1, padding: "6px" }}   value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          <select
            value={selectedRoomId}
            onChange={(e) => setSelectedRoomId(e.target.value)}
          >
            <option value="">Tất cả phòng</option>
            {Array.isArray(physicalRooms) &&
              physicalRooms.map((room) => (
                <option key={room.roomId} value={room.roomId}>
                  {room.roomName}
                </option>
              ))}
          </select>
          <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
            <option value="">Tất cả trạng thái</option>
            <option value="SCHEDULED">Đã đặt</option>
            <option value="CANCELLED">Hủy</option>
            <option value="ONGOING">Đang họp</option>
            <option value="COMPLETED">Hoàn thành</option>
          </select>
           <input type="date" value={dateRange.startDate.toISOString().split("T")[0]}
            onChange={(e) =>
              setDateRange({
                ...dateRange,
                startDate: new Date(e.target.value + "T00:00:00"),
              })
            }
          />
          
          <input type="date" value={dateRange.endDate.toISOString().split("T")[0]}
            onChange={(e) =>
              setDateRange({
                ...dateRange,
                endDate: new Date(e.target.value + "T23:59:59"),
              })
            }
          />
          <button style={{ padding: "6px 12px", background: "#3498db", color: "#fff", border: "none", borderRadius: "6px" }} onClick={handleApplyFilter}>
            Áp dụng
          </button>
          <button style={{ padding: "6px 12px", background: "#aaa", color: "#fff", border: "none", borderRadius: "6px" }} onClick={handleClearFilter}>
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
