import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "../assets/styles/MeetingRoomList.css";
import SearchBar from "../components/Searchbar";

const MeetingRoomList = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState("roomIdDesc");
  const [error] = useState("");
  const [setIsCreateFormOpen] = useState(false);

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
        onAddRoom={() => setIsCreateFormOpen(true)}
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
                  <td colSpan={9} style={{ textAlign: "center", padding: "24px" }}>
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
