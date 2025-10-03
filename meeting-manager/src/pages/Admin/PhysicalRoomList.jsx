import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "../../assets/styles/MeetingRoomList.css";
import {
  getAllPhysicalRooms,
  deletePhysicalRoom,
  createPhysicalRoom,
  updatePhysicalRoom,
  getPhysicalRoomById,
} from "../../services/physicalRoomService";
import SearchBar from "../../components/Searchbar";
import RoomForm from "../../components/RoomForm"; // 👉 import form
import Modal from "../../components/Modal";

const PhysicalRoomList = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState("idDesc");
  const [error, setError] = useState("");
  const [physicalRooms, setPhysicalRooms] = useState([]);
  const [deleteRoom, setDeleteRoom] = useState(null);

  // state cho dialog
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
      } catch (err) {
        alert("Không thể xóa phòng.");
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
    } catch (err) {
      alert("Lỗi khi lưu phòng.");
    }
  };

  return (
    <div>
      <SearchBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        sortOption={sortOption}
        setSortOption={setSortOption}
        onAddRoom={() => {
          setEditingRoomId(null);
          setFormRoom({ capacity: "", location: "", equipment: "", status: "AVAILABLE" });
          setIsDialogOpen(true);
        }}
      />

      {isDialogOpen && (
        <RoomForm
          formRoom={formRoom}
          setFormRoom={setFormRoom}
          onSave={handleSaveRoom}
          onCancel={() => setIsDialogOpen(false)}
          isEditing={!!editingRoomId}
        />
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
                        room.status === "AVAILABLE"
                          ? "badge-green"
                          : "badge-red"
                      }`}
                    >
                      {room.status}
                    </span>
                  </td>
                  <td>{room.createdAt}</td>
                  <td>{room.updatedAt || "-"}</td>
                  <td>
                    <div className="action-buttons">
                    <button
                      className="edit-button"
                      onClick={() => handleEditRoom(room.physicalId)}
                    >
                      ✎
                    </button>
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
        <Modal title="Delete confirm?" onClose={() => setDeleteRoom(null)}>
          <p>Bạn chắc chắn muốn xóa phòng <b>{deleteRoom.location}</b>?</p>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '15px' }}>
            <button onClick={() => setDeleteRoom(null)}>Hủy</button>
            <button
              style={{ background: '#e74c3c', color: '#fff' }}
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

export default PhysicalRoomList;
