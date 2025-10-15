import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Modal from "../../components/Modal";
import SearchBar from "../../components/Searchbar";
import"../../assets/styles/UserTable.css";
import { getAllMeetings, deleteMeeting} from "../../services/meetingService";

const MeetingList = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState("meetingIdDesc");
 const [meetingToDelete, setMeetingToDelete] = useState(null);
  const navigate = useNavigate();
  const [meetings, setMeetings] = useState([]);
  const [error, setError] = useState("");

   // ✅ Load meetings từ API
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

   // ✅ Xóa meeting
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
                  <button className="delete-button" onClick={() => setMeetingToDelete(m)}>✗</button>
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
          <p>Bạn chắc chắn muốn xóa cuộc họp <b>{deleteMeeting.title}</b>?</p>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '15px' }}>
            <button onClick={() => setMeetingToDelete(null)}>Hủy</button>
            <button
              style={{ background: '#e74c3c', color: '#fff' }}
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