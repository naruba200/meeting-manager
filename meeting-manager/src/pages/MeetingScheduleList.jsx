import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Modal from "../components/Modal";
import SearchBar from "../components/Searchbar";
import"../assets/styles/UserTable.css";

const MeetingList = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) navigate("/login");
  }, [navigate]);

  const [meetings, setMeetings] = useState([
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
  const [sortOption, setSortOption] = useState("meetingIdDesc");
  const [deleteMeeting, setDeleteMeeting] = useState(null);

  // ✅ Filtering + Sorting
  const visibleMeetings = useMemo(() => {
    let filtered = meetings.filter((m) =>
      [
        m.meetingId,
        m.title,
        m.description,
        m.roomName,
        m.status,
        m.organizerName,
        m.startTime,
        m.endTime,
      ]
        .join(" ")
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    );

    switch (sortOption) {
      case "titleAsc":
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "titleDesc":
        filtered.sort((a, b) => b.title.localeCompare(a.title));
        break;
      case "statusAsc":
        filtered.sort((a, b) => a.status.localeCompare(b.status));
        break;
      case "statusDesc":
        filtered.sort((a, b) => b.status.localeCompare(a.status));
        break;
      case "meetingIdAsc":
        filtered.sort((a, b) => a.meetingId - b.meetingId);
        break;
      case "meetingIdDesc":
      default:
        filtered.sort((a, b) => b.meetingId - a.meetingId);
        break;
    }

    return filtered;
  }, [searchQuery, sortOption, meetings]);

  const handleDeleteMeetingClick = (meeting) => {
    setDeleteMeeting(meeting);
  };

  const handleDeleteMeetingConfirmClick = () => {
    if (deleteMeeting) {
      setMeetings((prev) =>
        prev.filter((m) => m.meetingId !== deleteMeeting.meetingId)
      );
      setDeleteMeeting(null);
    }
  };

  const fmt = (s) => (s ? new Date(s).toLocaleString() : "");

  return (
    <div className="meeting-list-container">
      <SearchBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        sortOption={sortOption}
        setSortOption={setSortOption}
        showAdd={false}
      />
    <section className="content">
    <h1 className="page-title">MEETING SCHEDULE</h1>
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
                  <button className="delete-button" onClick={() => handleDeleteMeetingClick(m)}>✗</button>
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
    </section>

    {deleteMeeting && (
        <Modal title="Delete confirm?" onClose={() => setDeleteMeeting(null)}>
          <p>Bạn chắc chắn muốn xóa cuộc họp <b>{deleteMeeting.title}</b>?</p>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '15px' }}>
            <button onClick={() => setDeleteMeeting(null)}>Hủy</button>
            <button
              style={{ background: '#e74c3c', color: '#fff' }}
              onClick={handleDeleteMeetingConfirmClick}
            >
              Xóa
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default MeetingList;
