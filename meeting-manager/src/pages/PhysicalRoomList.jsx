import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "../assets/styles/MeetingRoomList.css"; // có thể tái dùng CSS bảng

const PhysicalRoomList = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState("idDesc");
  const [error, setError] = useState("");

  // dữ liệu mẫu (sau này gọi API /physical_rooms/all)
  const [physicalRooms, setPhysicalRooms] = useState([
    {
      physical_id: 1,
      capacity: 100,
      location: "Main Building - Floor 2",
      equipment: "Projector, Whiteboard, Sound System",
      status: "AVAILABLE",
      created_at: "2025-09-01 09:00:00",
      updated_at: "2025-09-20 14:00:00",
    },
    {
      physical_id: 2,
      capacity: 40,
      location: "Block B - Room 301",
      equipment: "TV Screen, Microphone",
      status: "UNAVAILABLE",
      created_at: "2025-09-05 10:00:00",
      updated_at: "2025-09-15 11:30:00",
    },
  ]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) navigate("/login");
  }, [navigate]);

  const visibleRooms = useMemo(() => {
    let filtered = physicalRooms.filter((room) =>
      [
        room.physical_id,
        room.capacity,
        room.location,
        room.equipment,
        room.status,
        room.created_at,
        room.updated_at,
      ]
        .join(" ")
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    );

    switch (sortOption) {
      case "capacityAsc":
        filtered.sort((a, b) => a.capacity - b.capacity);
        break;
      case "capacityDesc":
        filtered.sort((a, b) => b.capacity - a.capacity);
        break;
      case "idDesc":
      default:
        filtered.sort((a, b) => b.physical_id - a.physical_id);
        break;
    }
    return filtered;
  }, [searchQuery, sortOption, physicalRooms]);

  const handleEditRoom = (id) => {
    console.log("Edit physical room", id);
  };

  const handleDeleteRoom = (id) => {
    if (window.confirm("Are you sure you want to delete this room?")) {
      setPhysicalRooms((prev) => prev.filter((room) => room.physical_id !== id));
    }
  };

  return (
    <div>
      {/* Search và Actions */}
      <header className="header-actions">
        <input
          type="text"
          placeholder="Search physical rooms..."
          className="search-input"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button className="btn btn-purple" onClick={() => alert("Add room form")}>
          + Add Physical Room
        </button>
      </header>

      {/* Bảng */}
      <section className="content">
        <h1 className="page-title">PHYSICAL ROOM LIST</h1>
        {error && <div style={{ color: "red" }}>{error}</div>}
        <div className="table-container">
          <table className="user-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Capacity</th>
                <th>Location</th>
                <th>Equipment</th>
                <th>Status</th>
                <th>Created At</th>
                <th>Updated At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {visibleRooms.map((room) => (
                <tr key={room.physical_id}>
                  <td>{room.physical_id}</td>
                  <td>{room.capacity}</td>
                  <td>{room.location}</td>
                  <td>{room.equipment || "-"}</td>
                  <td>
                    <span
                      className={`badge ${
                        room.status === "AVAILABLE" ? "badge-green" : "badge-red"
                      }`}
                    >
                      {room.status}
                    </span>
                  </td>
                  <td>{room.created_at}</td>
                  <td>{room.updated_at || "-"}</td>
                  <td>
                    <button
                      className="btn btn-edit"
                      onClick={() => handleEditRoom(room.physical_id)}
                    >
                      ✎
                    </button>
                    <button
                      className="btn btn-delete"
                      onClick={() => handleDeleteRoom(room.physical_id)}
                    >
                      ✗
                    </button>
                  </td>
                </tr>
              ))}
              {visibleRooms.length === 0 && !error && (
                <tr>
                  <td colSpan={8} style={{ textAlign: "center", padding: "24px" }}>
                    No physical rooms found.
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

export default PhysicalRoomList;
