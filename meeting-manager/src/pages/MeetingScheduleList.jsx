import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "../assets/styles/MeetingList.css";

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
  const [isMainSidebarOpen, setIsMainSidebarOpen] = useState(true);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

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
    <div className="app-container">
      {/* Top Navbar */}
      <nav className="top-navbar">
        <span className="nav-icon">✉︎</span>
        <div className="user-menu-wrapper">
          <span
            className="nav-icon"
            style={{ cursor: "pointer" }}
            onClick={() => setShowUserMenu((p) => !p)}
          >
            🜲
          </span>
          {showUserMenu && (
            <div className="user-menu">
              <div className="user-menu-item">Thông tin tài khoản</div>
              <div className="user-menu-item" onClick={logout}>
                Đăng xuất
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Sidebar */}
      <aside className={`main-sidebar ${isMainSidebarOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <span>Views</span>
          <span
            className="menu-toggle"
            onClick={() => setIsMainSidebarOpen((s) => !s)}
          >
            ≡
          </span>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-item" onClick={() => navigate("/")}>
            <span className="nav-icon">🏠︎</span> Home
          </div>

          <div className="nav-item" onClick={() => navigate("/UserList")}>
            <span className="nav-icon">☺</span> User Management
          </div>

          <div
            className="nav-item active"
            onClick={() => navigate("/MeetingList")}
          >
            <span className="nav-icon">📅</span> Meeting
          </div>

          <div className="nav-item">
            <span className="nav-icon">⏻</span> Settings
          </div>
        </nav>
      </aside>

      {/* Main content */}
      <main className={`main-content ${!isMainSidebarOpen ? "full" : ""}`}>
        <section className="content">

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

          {/* Table */}
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
                  </tr>
                ))}
                {visibleMeetings.length === 0 && (
                  <tr>
                    <td colSpan={8} style={{ textAlign: "center", padding: "20px" }}>
                      Không tìm thấy cuộc họp nào
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
};

export default MeetingList;
