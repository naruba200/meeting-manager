// MeetingScheduleList.jsx
import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Modal from "../../components/Modal";
import SearchBar from "../../components/Searchbar";
import "../../assets/styles/UserTable.css";
import { getAllMeetings, deleteMeeting } from "../../services/meetingService";
import { FiTrash2 } from "react-icons/fi";

const MeetingList = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortType, setSortType] = useState("title-asc"); // e.g., 'title-asc', 'title-desc', 'startTime-desc', 'startTime-asc'
  const [meetingToDelete, setMeetingToDelete] = useState(null);
  const navigate = useNavigate();
  const [meetings, setMeetings] = useState([]);
  const [error, setError] = useState("");

  // Load meetings từ API
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    fetchMeetings();
  }, [navigate]);

  const fetchMeetings = async () => {
    try {
      const data = await getAllMeetings();
      // Nếu API trả về object có "content", thì lấy content ra
      setMeetings(Array.isArray(data.content) ? data.content : []);
    } catch (err) {
      console.error("Lỗi khi tải danh sách cuộc họp:", err);
      setError("Không thể tải danh sách cuộc họp.");
    }
  };

  // Filtering + Sorting
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

    // Sort based on sortType
    const [sortBy, sortOrder] = sortType.split('-');
    if (sortBy === 'title') {
      filtered.sort((a, b) => {
        const titleA = (a.title || "").toLowerCase();
        const titleB = (b.title || "").toLowerCase();
        if (sortOrder === "asc") {
          return titleA.localeCompare(titleB);
        } else {
          return titleB.localeCompare(titleA);
        }
      });
    } else if (sortBy === 'startTime') {
      filtered.sort((a, b) => {
        const dateA = new Date(a.startTime).getTime();
        const dateB = new Date(b.startTime).getTime();
        if (sortOrder === "asc") {
          return dateA - dateB; // Earliest first
        } else {
          return dateB - dateA; // Latest first
        }
      });
    }

    return filtered;
  }, [searchQuery, sortType, meetings]);

  // Xóa meeting
  const handleDeleteMeeting = async (id) => {
    try {
      await deleteMeeting(id);
      fetchMeetings();
      setMeetingToDelete(null);
    } catch (err) {
      alert("Lỗi khi xóa meeting");
    }
  };

  const fmt = (s) => (s ? new Date(s).toLocaleString() : "");

  // Sort options
  const sortOptions = [
    { value: "title-asc", label: "Title A-Z" },
    { value: "title-desc", label: "Title Z-A" },
    { value: "startTime-asc", label: "Start Time Earliest" },
    { value: "startTime-desc", label: "Start Time Latest" },
  ];

  return (
    <div className="user-list-container">
      {/* Header */}
      <div className="user-list-header">
        <div className="header-content">
          <div className="title-section">
            <h1 className="page-title">MEETING SCHEDULE</h1>
          </div>
          <div className="filter-bar">
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            <select
              value={sortType}
              onChange={(e) => setSortType(e.target.value)}
              className="filter-select"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <section className="content-section">
        {error && <div className="error-message">{error}</div>}
        <div className="table-wrapper">
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
                          ? "active"
                          : "blocked"
                      }`}
                    >
                      {m.status}
                    </span>
                  </td>
                  <td>{m.organizerName}</td>
                  <td className="user-actions">
                    <button 
                      className="action-btn delete-btn" 
                      onClick={() => setMeetingToDelete(m)}
                    >
                      <FiTrash2 size={14} />
                    </button>
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

      {meetingToDelete && (
        <Modal title="Delete confirm?" onClose={() => setMeetingToDelete(null)}>
          <p>Bạn chắc chắn muốn xóa cuộc họp <b>{meetingToDelete.title}</b>?</p>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '15px' }}>
            <button className="btn-secondary" onClick={() => setMeetingToDelete(null)}>Hủy</button>
            <button
              className="btn-danger"
              onClick={() => handleDeleteMeeting(meetingToDelete.meetingId)}
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