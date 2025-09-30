import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "../assets/styles/MeetingScheduleList.css";

const MeetingList = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) navigate("/login");
  }, [navigate]);

  const [meetings] = useState([
    {
      meetingId: 1,
      title: "Sprint Planning",
      description: "Discuss backlog and plan tasks for next sprint.",
      roomName: "Room A",
      startTime: "2025-09-28T09:00:00",
      endTime: "2025-09-28T11:00:00",
      status: "SCHEDULED",
      organizerName: "Alice",
    },
    {
      meetingId: 2,
      title: "Daily Standup",
      description: "Quick update on blockers and progress.",
      roomName: "Room B",
      startTime: "2025-09-28T10:00:00",
      endTime: "2025-09-28T10:15:00",
      status: "ONGOING",
      organizerName: "Bob",
    },
  ]);

  const [searchQuery, setSearchQuery] = useState("");

  const visibleMeetings = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return meetings;
    return meetings.filter(
      (m) =>
        (m.title || "").toLowerCase().includes(q) ||
        (m.roomName || "").toLowerCase().includes(q) ||
        (m.description || "").toLowerCase().includes(q) ||
        String(m.meetingId).includes(q)
    );
  }, [meetings, searchQuery]);

  const fmt = (s) => (s ? new Date(s).toLocaleString() : "");

  return (
    <div className="meeting-list-container">
      {/* Thanh tìm kiếm */}
      <div className="toolbar-container">
        <input
          type="text"
          placeholder="Search meetings (title, room, description, id)..."
          className="search-input"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <h1 className="page-title">MEETING LIST</h1>

      {/* Bảng danh sách */}
      <div className="table-container">
        <table className="user-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tiêu đề</th>
              <th>Mô tả</th>
              <th>Phòng</th>
              <th>Bắt đầu</th>
              <th>Kết thúc</th>
              <th>Trạng thái</th>
              <th>Người tổ chức</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {visibleMeetings.map((m) => (
              <tr key={m.meetingId}>
                <td>{m.meetingId}</td>
                <td>{m.title}</td>
                <td>{m.description || "-"}</td>
                <td>{m.roomName}</td>
                <td>{fmt(m.startTime)}</td>
                <td>{fmt(m.endTime)}</td>
                <td>
                  <span
                    className={`status-badge ${
                      m.status === "ONGOING" || m.status === "SCHEDULED"
                        ? "status-active"
                        : "status-inactive"
                    }`}
                  >
                    {m.status}
                  </span>
                </td>
                <td>{m.organizerName}</td>
                <td className="user-actions">
                  <button className="edit-btn">Edit</button>
                  <button className="delete-btn">Delete</button>
                </td>
              </tr>
            ))}
            {visibleMeetings.length === 0 && (
              <tr>
                <td colSpan={9} style={{ textAlign: "center", padding: "20px" }}>
                  Không tìm thấy cuộc họp nào
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MeetingList;
