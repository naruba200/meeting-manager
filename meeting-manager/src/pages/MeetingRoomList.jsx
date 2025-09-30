import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "../assets/styles/MeetingRoomList.css";
import SearchBar from "../components/Searchbar";
import "../assets/styles/UserTable.css";
import Modal from "../components/Modal";

const MeetingRoomList = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState("roomIdDesc");
  const [error] = useState("");
  const [deleteUser, setDeleteUser] = useState(null); 

  const [meetingRooms, setMeetingRooms] = useState([
    {
      roomId: 2,
      roomName: "Main Hall",
      type: "PHYSICAL",
      status: "AVAILABLE",
      physicalId: "PH-001",
      onlineId: null,
      createdAt: "2025-09-01",
      updatedAt: "2025-09-20",
    },
    {
      roomId: 1,
      roomName: "Zoom Room",
      type: "VIRTUAL",
      status: "UNAVAILABLE",
      physicalId: null,
      onlineId: "ON-100",
      createdAt: "2025-08-15",
      updatedAt: "2025-09-10",
    },
  ]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) navigate("/login");
  }, [navigate]);

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

  const handleDeleteRoom = (roomId) => {
    const room = meetingRooms.find((r) => r.roomId === roomId);
    setDeleteUser(room); // ✅ open modal instead of deleting immediately
  };

  const handleDeleteUserConfirm = () => {
    if (deleteUser) {
      setMeetingRooms((prev) =>
        prev.filter((room) => room.roomId !== deleteUser.roomId)
      );
      setDeleteUser(null);
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
      {deleteUser && (
        <Modal title="Delete confirm?" onClose={() => setDeleteUser(null)}>
          <p>
            Bạn chắc chắn muốn xóa phòng họp <b>{deleteUser.roomName}</b>?
          </p>
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "10px",
              marginTop: "15px",
            }}
          >
            <button onClick={() => setDeleteUser(null)}>Hủy</button>
            <button
              style={{ background: "#e74c3c", color: "#fff" }}
              onClick={handleDeleteUserConfirm}
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
