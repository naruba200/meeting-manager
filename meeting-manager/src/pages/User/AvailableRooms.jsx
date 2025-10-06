// AvailableRooms.jsx
import React, { useState } from "react";
import { FaCalendarAlt, FaUsers, FaBuilding, FaVideo } from "react-icons/fa";
import "../../assets/styles/UserCSS/AvailableRooms.css";

const AvailableRooms = () => {
  const [form, setForm] = useState({
    startTime: "",
    endTime: "",
    participants: 1,
    roomType: "PHYSICAL",
  });

  const [rooms, setRooms] = useState([]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const fetchAvailableRooms = () => {
    if (!form.startTime || !form.endTime) {
      setRooms([]);
      return;
    }

    const mockRooms =
      form.roomType === "PHYSICAL"
        ? [
            { roomId: 1, roomName: "Phòng 101", capacity: 20, type: "PHYSICAL", location: "Tầng 1" },
            { roomId: 2, roomName: "Phòng 202", capacity: 15, type: "PHYSICAL", location: "Tầng 2" },
            { roomId: 3, roomName: "Phòng 305", capacity: 25, type: "PHYSICAL", location: "Tầng 3" },
          ]
        : [
            { roomId: 4, roomName: "Zoom Pro", type: "ONLINE", platform: "Zoom" },
            { roomId: 5, roomName: "Teams Room", type: "ONLINE", platform: "Microsoft Teams" },
          ];

    const filtered = form.roomType === "PHYSICAL"
      ? mockRooms.filter((r) => r.capacity >= form.participants)
      : mockRooms;

    setRooms(filtered);
  };

  return (
    <div className="available-rooms-container">
      <h2>Danh sách phòng trống</h2>
      <p>Chọn thời gian và tiêu chí để tìm phòng phù hợp</p>

      {/* Bộ lọc */}
      <div className="filter-form">
        <div className="form-row">
          <div className="form-group">
            <label>Thời gian bắt đầu</label>
            <div className="input-with-icon">
              <FaCalendarAlt className="input-icon" />
              <input
                type="datetime-local"
                name="startTime"
                value={form.startTime}
                onChange={handleFormChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Thời gian kết thúc</label>
            <div className="input-with-icon">
              <FaCalendarAlt className="input-icon" />
              <input
                type="datetime-local"
                name="endTime"
                value={form.endTime}
                onChange={handleFormChange}
              />
            </div>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Loại phòng</label>
            <div className="room-type-selector">
              <button
                type="button"
                className={`room-type-btn ${form.roomType === "PHYSICAL" ? "active" : ""}`}
                onClick={() => setForm({ ...form, roomType: "PHYSICAL" })}
              >
                <FaBuilding /> Phòng vật lý
              </button>
              <button
                type="button"
                className={`room-type-btn ${form.roomType === "ONLINE" ? "active" : ""}`}
                onClick={() => setForm({ ...form, roomType: "ONLINE" })}
              >
                <FaVideo /> Phòng online
              </button>
            </div>
          </div>

          {form.roomType === "PHYSICAL" && (
            <div className="form-group">
              <label>Số người tham gia</label>
              <div className="input-with-icon">
                <FaUsers className="input-icon" />
                <input
                  type="number"
                  name="participants"
                  min="1"
                  value={form.participants}
                  onChange={handleFormChange}
                />
              </div>
            </div>
          )}
        </div>

        <button className="btn-search" onClick={fetchAvailableRooms}>
          Tìm phòng trống
        </button>
      </div>

      {/* Danh sách phòng */}
      <div className="rooms-list">
        {rooms.length > 0 ? (
          rooms.map((room) => (
            <div key={room.roomId} className="room-card">
              <h3>{room.roomName}</h3>
              <p>
                {room.type === "PHYSICAL"
                  ? `Sức chứa: ${room.capacity} người • ${room.location}`
                  : `Nền tảng: ${room.platform}`}
              </p>
              <button className="btn-select">Chọn phòng</button>
            </div>
          ))
        ) : (
          <p className="empty-state">Chưa có phòng nào phù hợp.</p>
        )}
      </div>
    </div>
  );
};

export default AvailableRooms;
