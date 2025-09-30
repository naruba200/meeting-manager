import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "../assets/styles/MeetingRoomList.css";
import {
  getAllPhysicalRooms,
  deletePhysicalRoom,
  createPhysicalRoom,
  updatePhysicalRoom,
  getPhysicalRoomById,
} from "../services/physicalRoomService";

const PhysicalRoomList = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState("idDesc");
  const [error, setError] = useState("");
  const [physicalRooms, setPhysicalRooms] = useState([]);

  // state cho dialog
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRoomId, setEditingRoomId] = useState(null);
  const [formRoom, setFormRoom] = useState({
    capacity: "",
    location: "",
    equipment: "",
    status: "AVAILABLE",
  });

  // Load dữ liệu từ API
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
    } catch (err) {
      setError("Không thể tải danh sách phòng vật lý.");
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

    switch (sortOption) {
      case "capacityAsc":
        filtered.sort((a, b) => a.capacity - b.capacity);
        break;
      case "capacityDesc":
        filtered.sort((a, b) => b.capacity - a.capacity);
        break;
      case "idDesc":
      default:
        filtered.sort((a, b) => b.physicalId - a.physicalId);
        break;
    }
    return filtered;
  }, [searchQuery, sortOption, physicalRooms]);

  const handleAddRoom = () => {
    setEditingRoomId(null);
    setFormRoom({ capacity: "", location: "", equipment: "", status: "AVAILABLE" });
    setIsDialogOpen(true);
  };

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
    } catch (err) {
      alert("Không thể tải thông tin phòng.");
    }
  };

  const handleDeleteRoom = async (id) => {
    if (window.confirm("Are you sure you want to delete this room?")) {
      try {
        await deletePhysicalRoom(id);
        setPhysicalRooms((prev) => prev.filter((room) => room.physicalId !== id));
      } catch (err) {
        alert("Không thể xóa phòng.");
      }
    }
  };

  const handleSaveRoom = async () => {
    try {
      if (editingRoomId) {
        // edit
        await updatePhysicalRoom(editingRoomId, formRoom);
      } else {
        // create
        await createPhysicalRoom(formRoom);
      }
      setIsDialogOpen(false);
      setEditingRoomId(null);
      setFormRoom({ capacity: "", location: "", equipment: "", status: "AVAILABLE" });
      fetchRooms();
    } catch (err) {
      alert("Lỗi khi lưu phòng.");
    }
  };

  return (
    <div>
      <header className="header-actions">
        <input
          type="text"
          placeholder="Search physical rooms..."
          className="search-input"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button className="btn btn-purple" onClick={handleAddRoom}>
          + Add Physical Room
        </button>
      </header>

      {/* Dialog Add/Edit Room */}
      {isDialogOpen && (
        <div className="modal-backdrop">
          <div className="modal">
            <h2>{editingRoomId ? "Edit Physical Room" : "Create Physical Room"}</h2>
            <div className="form-group">
              <label>Capacity</label>
              <input
                type="number"
                value={formRoom.capacity}
                onChange={(e) => setFormRoom({ ...formRoom, capacity: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Location</label>
              <input
                type="text"
                value={formRoom.location}
                onChange={(e) => setFormRoom({ ...formRoom, location: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Equipment</label>
              <textarea
                value={formRoom.equipment}
                onChange={(e) => setFormRoom({ ...formRoom, equipment: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Status</label>
              <select
                value={formRoom.status}
                onChange={(e) => setFormRoom({ ...formRoom, status: e.target.value })}
              >
                <option value="AVAILABLE">AVAILABLE</option>
                <option value="UNAVAILABLE">UNAVAILABLE</option>
              </select>
            </div>
            <div className="modal-actions">
              <button className="btn btn-green" onClick={handleSaveRoom}>
                Save
              </button>
              <button className="btn btn-delete" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

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
                <tr key={room.physicalId}>
                  <td>{room.physicalId}</td>
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
                  <td>{room.createdAt}</td>
                  <td>{room.updatedAt || "-"}</td>
                  <td>
                    <button
                      className="btn btn-edit"
                      onClick={() => handleEditRoom(room.physicalId)}
                    >
                      ✎
                    </button>
                    <button
                      className="btn btn-delete"
                      onClick={() => handleDeleteRoom(room.physicalId)}
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
