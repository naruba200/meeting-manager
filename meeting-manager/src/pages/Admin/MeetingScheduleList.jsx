// MeetingScheduleList.jsx
import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Modal from "../../components/Modal";
import SearchBar from "../../components/Searchbar";
import "../../assets/styles/UserTable.css";
import { deleteMeeting } from "../../services/meetingService";
import reportService from "../../services/reportService";
import { FiTrash2 } from "react-icons/fi";

const MeetingList = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortType, setSortType] = useState("title-asc"); // e.g., 'title-asc', 'title-desc', 'startTime-desc', 'startTime-asc'
  const [meetingToDelete, setMeetingToDelete] = useState(null);
  const navigate = useNavigate();
  const [meetings, setMeetings] = useState([]);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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
      const data = await reportService.getAllMeetings(1000); // Fetch up to 1000 meetings
      // Handle both array and paginated object responses
      if (Array.isArray(data)) {
        setMeetings(data);
      } else if (data.content && Array.isArray(data.content)) {
        setMeetings(data.content);
      } else {
        setMeetings([]);
      }
    } catch (err) {
      console.error("Lỗi khi tải danh sách cuộc họp:", err);
      setError("Không thể tải danh sách cuộc họp.");
    }
  };

  // Filtering + Sorting
  const filteredMeetings = useMemo(() => {
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

  // Pagination
  const totalPages = Math.ceil(filteredMeetings.length / itemsPerPage);
  const visibleMeetings = filteredMeetings.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset page when search or sort changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, sortType]);

  // Generate pagination array with ellipsis
  const getPaginationArray = () => {
    const pages = [];
    const maxVisible = 5; // Show max 5 page buttons (including ellipsis)
    
    if (totalPages <= maxVisible) {
      // Show all pages if 5 or less
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);
      
      // Calculate range around current page
      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, currentPage + 1);
      
      // Adjust range if near start or end
      if (currentPage <= 3) {
        endPage = 4;
      } else if (currentPage >= totalPages - 2) {
        startPage = totalPages - 3;
      }
      
      // Add ellipsis before range
      if (startPage > 2) {
        pages.push('...');
      }
      
      // Add range
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
      
      // Add ellipsis after range
      if (endPage < totalPages - 1) {
        pages.push('...');
      }
      
      // Always show last page
      pages.push(totalPages);
    }
    
    return pages;
  };

  // Xóa meeting
  const handleDeleteMeeting = async (id) => {
    try {
      await deleteMeeting(id);
      fetchMeetings();
      setMeetingToDelete(null);
    } catch {
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination">
            <button
              className={`page-btn ${currentPage === 1 ? "disabled" : ""}`}
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            >
              Previous
            </button>

            {getPaginationArray().map((page, index) => (
              page === '...' ? (
                <span key={`ellipsis-${index}`} className="page-ellipsis">...</span>
              ) : (
                <button
                  key={page}
                  className={`page-btn ${currentPage === page ? "active" : ""}`}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </button>
              )
            ))}

            <button
              className={`page-btn ${currentPage === totalPages ? "disabled" : ""}`}
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            >
              Next
            </button>
          </div>
        )}
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