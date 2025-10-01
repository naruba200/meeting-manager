import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import SearchBar from "../components/Searchbar";
import "../assets/styles/UserTable.css";
import Modal from "../components/Modal";
import { getAllMeetingRooms,deleteMeetingRoom } from "../services/meetingRoomService";

const MeetingRoomList = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState("roomIdDesc");
  const [error, setError] = useState("");
  const [deleteRoom, setDeleteRoom] = useState(null); 
  const [meetingRooms, setMeetingRooms] = useState([]);

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

  // ✅ Xóa phòng họp
  const handleDeleteRoom = async (roomId) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa phòng này?")) {
      try {
        await deleteMeetingRoom(roomId);
        fetchRooms();
      } catch (err) {
        alert("Lỗi khi xóa phòng họp");
      }
    }
  };

  const handleDeleteRoomConfirm = () => {
    if (deleteRoom) {
      setMeetingRooms((prev) =>
        prev.filter((room) => room.roomId !== deleteRoom.roomId)
      );
      setDeleteRoom(null);
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

      {/* MeetingTable */}
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
                        onClick={() => handleDeleteRoom(room.roomId)}
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

      {/* Delete Confirmation Modal */}
      {deleteRoom && (
        <Modal title="Delete confirm?" onClose={() => setDeleteRoom(null)}>
          <p>
            Bạn chắc chắn muốn xóa phòng họp <b>{deleteRoom.roomName}</b>?
          </p>
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "10px",
              marginTop: "15px",
            }}
          >
            <button onClick={() => setDeleteRoom(null)}>Hủy</button>
            <button
              style={{ background: "#e74c3c", color: "#fff" }}
              onClick={handleDeleteRoomConfirm}
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
