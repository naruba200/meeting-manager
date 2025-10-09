import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import SearchBar from "../../components/Searchbar";
import "../../assets/styles/UserTable.css";
import Modal from "../../components/Modal";
import { getAllMeetingRooms, deleteMeetingRoom } from "../../services/meetingRoomService";

const MeetingRoomList = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState("roomIdDesc");
  const [error, setError] = useState("");
  const [meetingRooms, setMeetingRooms] = useState([]);
  const [roomToDelete, setRoomToDelete] = useState(null); // ✅ dùng tên rõ ràng hơn

  // ✅ Load danh sách phòng từ API
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    fetchRooms();
  }, [navigate]);

  const fetchRooms = async () => {
    try {
      const data = await getAllMeetingRooms();
      setMeetingRooms(data);
    } catch (err) {
      setError("Không thể tải danh sách phòng họp.");
    }
  };

  const visibleMeetingRooms = useMemo(() => {
    let filtered = meetingRooms.filter((room) =>
      [
        room.roomId,
        room.roomName,
        room.type,
        room.status,
        room.physicalId,
        room.onlineId,
        room.createdAt,
        room.updatedAt,
      ]
        .join(" ")
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    );

    switch (sortOption) {
      case "nameAsc":
        filtered.sort((a, b) => a.roomName.localeCompare(b.roomName));
        break;
      case "nameDesc":
        filtered.sort((a, b) => b.roomName.localeCompare(a.roomName));
        break;
      case "roomIdDesc":
      default:
        filtered.sort((a, b) => b.roomId - a.roomId);
        break;
    }
    return filtered;
  }, [searchQuery, sortOption, meetingRooms]);

  // ✅ Khi nhấn nút Xóa
  const handleDeleteRoomClick = (room) => {
    setRoomToDelete(room); // mở modal xác nhận
  };

  // ✅ Khi xác nhận trong modal
  const handleConfirmDelete = async () => {
    if (!roomToDelete) return;

    try {
      await deleteMeetingRoom(roomToDelete.roomId);
      setMeetingRooms((prev) =>
        prev.filter((r) => r.roomId !== roomToDelete.roomId)
      );
      setRoomToDelete(null);
    } catch (err) {
      console.error("Lỗi khi xóa phòng:", err);
      alert("Lỗi khi xóa phòng họp");
    }
  };

  return (
    <div>
      <SearchBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        sortOption={sortOption}
        setSortOption={setSortOption}
        showAdd={false}
      />

      {/* Meeting Table */}
      <section className="content">
        <h1 className="page-title">MEETING ROOM</h1>
        <div className="table-container">
          <table className="user-table">
            <thead>
              <tr>
                <th>Room ID</th>
                <th>Room Name</th>
                <th>Type</th>
                <th>Status</th>
                <th>Physical ID</th>
                <th>Online ID</th>
                <th>Created At</th>
                <th>Updated At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {visibleMeetingRooms.map((room) => (
                <tr key={room.roomId}>
                  <td>{room.roomId}</td>
                  <td>{room.roomName}</td>
                  <td>{room.type}</td>
                  <td>{room.status}</td>
                  <td>{room.physicalId || "-"}</td>
                  <td>{room.onlineId || "-"}</td>
                  <td>{room.createdAt}</td>
                  <td>{room.updatedAt}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="delete-button"
                        onClick={() => handleDeleteRoomClick(room)}
                      >
                        ✗
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {visibleMeetingRooms.length === 0 && !error && (
                <tr>
                  <td colSpan={9} style={{ textAlign: "center", padding: "24px" }}>
                    No meeting rooms found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* ✅ Modal xác nhận xóa */}
      {roomToDelete && (
        <Modal title="Xác nhận xóa phòng họp" onClose={() => setRoomToDelete(null)}>
          <p>
            Bạn chắc chắn muốn xóa phòng <b>{roomToDelete.roomName}</b>?
          </p>
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "10px",
              marginTop: "15px",
            }}
          >
            <button onClick={() => setRoomToDelete(null)}>Hủy</button>
            <button
              style={{ background: "#e74c3c", color: "#fff" }}
              onClick={handleConfirmDelete}
            >
              Xóa
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default MeetingRoomList;
