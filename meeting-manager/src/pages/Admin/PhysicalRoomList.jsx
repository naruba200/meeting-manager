// PhysicalRoomList.jsx
import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "../../assets/styles/UserTable.css"; // Use consistent UserTable.css
import {
  getAllPhysicalRooms,
  deletePhysicalRoom,
  createPhysicalRoom,
  updatePhysicalRoom,
  getPhysicalRoomById,
} from "../../services/physicalRoomService";
import SearchBar from "../../components/Searchbar";
import RoomForm from "../../components/RoomForm";
import Modal from "../../components/Modal";
import { FiEdit2, FiTrash2 } from "react-icons/fi";

const PhysicalRoomList = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortType, setSortType] = useState("location-asc"); // e.g., 'location-asc', 'location-desc', 'createdAt-desc', 'createdAt-asc'
  const [error, setError] = useState("");
  const [physicalRooms, setPhysicalRooms] = useState([]);
  const [deleteRoom, setDeleteRoom] = useState(null);

  // Dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRoomId, setEditingRoomId] = useState(null);
  const [formRoom, setFormRoom] = useState({
    capacity: "",
    location: "",
    equipment: "",
    status: "AVAILABLE",
  });

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
      const res = await getAllPhysicalRooms();
      setPhysicalRooms(res);
    } catch {
      setError("Failed to load the list of physical rooms.");
    }
  };

  const visibleRooms = useMemo(() => {
    let filtered = physicalRooms.filter((room) =>
      [
        room.physicalId,
        room.capacity,
        room.location,
        room.equipment,
        room.status,
        room.createdAt,
        room.updatedAt,
      ]
        .join(" ")
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    );

    // Sort based on sortType
    const [sortBy, sortOrder] = sortType.split('-');
    if (sortBy === 'location') {
      filtered.sort((a, b) => {
        const locA = (a.location || "").toLowerCase();
        const locB = (b.location || "").toLowerCase();
        if (sortOrder === "asc") {
          return locA.localeCompare(locB);
        } else {
          return locB.localeCompare(locA);
        }
      });
    } else if (sortBy === 'createdAt') {
      filtered.sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        if (sortOrder === "asc") {
          return dateA - dateB; // Oldest first
        } else {
          return dateB - dateA; // Newest first
        }
      });
    }

    return filtered;
  }, [searchQuery, sortType, physicalRooms]);

  const handleEditRoom = async (id) => {
    try {
      const room = await getPhysicalRoomById(id);
      setEditingRoomId(id);
      setFormRoom({
        capacity: room.capacity || "",
        location: room.location || "",
        equipment: room.equipment || "",
        status: room.status || "AVAILABLE",
      });
      setIsDialogOpen(true);
    } catch {
      alert("Unable to load room information.");
    }
  };

  const handleDeleteRoomClick = (room) => {
    setDeleteRoom(room);
  };

  const handleDeleteRoomConfirm = async () => {
    if (deleteRoom) {
      try {
        await deletePhysicalRoom(deleteRoom.physicalId);
        setPhysicalRooms((prev) =>
          prev.filter((room) => room.physicalId !== deleteRoom.physicalId)
        );
        setDeleteRoom(null);
      } catch {
        alert("Failed to delete the room.");
      }
    }
  };

  const handleSaveRoom = async () => {
    try {
      if (editingRoomId) {
        await updatePhysicalRoom(editingRoomId, formRoom);
      } else {
        await createPhysicalRoom(formRoom);
      }
      setIsDialogOpen(false);
      setEditingRoomId(null);
      setFormRoom({
        capacity: "",
        location: "",
        equipment: "",
        status: "AVAILABLE",
      });
      fetchRooms();
    } catch {
      alert("Failed to save room.");
    }
  };

  // Sort options
  const sortOptions = [
    { value: "location-asc", label: "Location A-Z" },
    { value: "location-desc", label: "Location Z-A" },
    { value: "createdAt-desc", label: "Created Date Newest" },
    { value: "createdAt-asc", label: "Created Date Oldest" },
  ];

  return (
    <div className="user-list-container">
      {/* Header */}
      <div className="user-list-header">
        <div className="header-content">
          <div className="title-section">
            <h1 className="page-title">PHYSICAL ROOM LIST</h1>
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
            <button className="add-user-btn" onClick={() => setIsDialogOpen(true)}>
              Add Room
            </button>
          </div>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {isDialogOpen && (
        <RoomForm
          formRoom={formRoom}
          setFormRoom={setFormRoom}
          onSave={handleSaveRoom}
          onCancel={() => setIsDialogOpen(false)}
          isEditing={!!editingRoomId}
        />
      )}

      <section className="content-section">
        <div className="table-wrapper">
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
                <tr key={room.physicalId}>
                  <td>{room.physicalId}</td>
                  <td>{room.capacity}</td>
                  <td>{room.location}</td>
                  <td>{room.equipment || "-"}</td>
                  <td>
                    <span
                      className={`status-badge ${room.status === "AVAILABLE" ? "active" : "blocked"}`}
                    >
                      {room.status}
                    </span>
                  </td>
                  <td>{room.createdAt}</td>
                  <td>{room.updatedAt || "-"}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="action-btn edit-btn"
                        onClick={() => handleEditRoom(room.physicalId)}
                      >
                        <FiEdit2 size={14} />
                      </button>
                      <button
                        className="action-btn delete-btn"
                        onClick={() => handleDeleteRoomClick(room)}
                      >
                        <FiTrash2 size={14} />
                      </button>
                    </div>
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

      {deleteRoom && (
        <Modal title="Delete Confirmation" onClose={() => setDeleteRoom(null)}>
          <p>
            Are you sure you want to delete the room <b>{deleteRoom.location}</b>?
          </p>
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "10px",
              marginTop: "15px",
            }}
          >
            <button className="btn-secondary" onClick={() => setDeleteRoom(null)}>
              Cancel
            </button>
            <button
              className="btn-danger"
              onClick={handleDeleteRoomConfirm}
            >
              Delete
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default PhysicalRoomList;