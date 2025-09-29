import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../layouts/Layout";
import "../assets/styles/MeetingRoomList.css";
import SearchBar from "../components/Searchbar";

const MeetingRoomList = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState("roomIdDesc");
  const [error] = useState("");
  const [setIsCreateFormOpen] = useState(false);

  const [meetingRooms, setMeetingRooms] = useState([
    { roomId: 2, roomName: "Main Hall", type: "PHYSICAL", status: "AVAILABLE" },
    { roomId: 1, roomName: "Zoom Room", type: "VIRTUAL", status: "UNAVAILABLE" },
  ]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) navigate("/login");
  }, [navigate]);

  const visibleMeetingRooms = useMemo(() => {
    let filtered = meetingRooms.filter((room) =>
      [room.roomId, room.roomName, room.type, room.status]
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

  const handleEditRoom = (roomId) => {
    console.log("Edit room", roomId);
  };

  const handleDeleteRoom = (roomId) => {
    if (window.confirm("Are you sure you want to delete this room?")) {
      setMeetingRooms((prev) => prev.filter((room) => room.roomId !== roomId));
    }
  };

  return (
    <div>
      <SearchBar
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
      sortOption={sortOption}
      setSortOption={setSortOption}
      onAddRoom={() => setIsCreateFormOpen(true) }
      />
      {/* MeetingTable */}
      <section className="content">
        <h1 className="page-title">MEETING ROOM LIST</h1>
        <div className="table-container">
          <table className="user-table">
            <thead>
              <tr>
                <th>Room ID</th>
                <th>Room Name</th>
                <th>Type</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {visibleMeetingRooms.map((room) => (
                <tr key={room.roomId}>
                  <td style={{ fontWeight: "600", color: "#3498db" }}>{room.roomId}</td>
                  <td style={{ fontWeight: "500" }}>{room.roomName}</td>
                  <td>
                    <span
                      style={{
                        background: room.type === "PHYSICAL" ? "#e8f4fd" : "#f0faff",
                        color: room.type === "PHYSICAL" ? "#2980b9" : "#2c3e50",
                        padding: "4px 8px",
                        borderRadius: "12px",
                        fontSize: "12px",
                        fontWeight: "600",
                      }}
                    >
                      {room.type}
                    </span>
                  </td>
                  <td>
                    <span
                      style={{
                        background: room.status === "AVAILABLE" ? "#f0fff0" : "#fff0f0",
                        color: room.status === "AVAILABLE" ? "#27ae60" : "#e74c3c",
                        padding: "4px 8px",
                        borderRadius: "12px",
                        fontSize: "12px",
                        fontWeight: "600",
                      }}
                    >
                      {room.status}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="edit-button"
                        onClick={() => handleEditRoom(room.roomId)}
                      >
                        ✎
                      </button>
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
                  <td colSpan={5} style={{ textAlign: "center", padding: "24px", color: "#718096" }}>
                    No meeting rooms found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default MeetingRoomList;
