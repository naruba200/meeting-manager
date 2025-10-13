// AvailableRooms.jsx
import React, { useState } from "react";
import { FaCalendarAlt, FaUsers, FaBuilding, FaVideo } from "react-icons/fa";
import Datetime from "react-datetime";
import "react-datetime/css/react-datetime.css";
import moment from "moment";
import "../../assets/styles/UserCSS/AvailableRooms.css";
import { filterAvailablePhysicalRooms } from "../../services/physicalRoomService.js";

const AvailableRooms = () => {
  const [form, setForm] = useState({
    startTime: "",
    endTime: "",
    participants: 1,
    roomType: "PHYSICAL",
  });

  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Thay đổi input text / number
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  // Định dạng ngày hiển thị trong input
  const formatDate = (date) => {
    return date ? moment(date).format("DD/MM/YYYY HH:mm") : "";
  };

  // Cập nhật thời gian (convert về format backend yêu cầu)
  const handleDateTimeChange = (field, date) => {
    if (moment.isMoment(date)) {
      setForm((prev) => ({
        ...prev,
        [field]: date.format("YYYY-MM-DDTHH:mm:ss"), // ví dụ 2025-10-27T14:00:00
      }));
    } else {
      setForm((prev) => ({ ...prev, [field]: "" }));
    }
  };

  // Gọi API lấy danh sách phòng trống
  const fetchAvailableRooms = async () => {
    if (!form.startTime || !form.endTime) {
      setError("Vui lòng chọn thời gian bắt đầu và kết thúc!");
      setRooms([]);
      return;
    }

    setLoading(true);
    setError("");

    try {
      if (form.roomType === "PHYSICAL") {
        console.log("🔹 Gửi dữ liệu lên BE:", {
          capacity: form.participants,
          startTime: form.startTime,
          endTime: form.endTime,
        });

        // Gọi API (POST)
        const data = await filterAvailablePhysicalRooms(
          form.startTime,
          form.endTime,
          form.participants
        );

        const filtered = data.filter((room) => room.capacity >= form.participants);
        setRooms(filtered);
      } else {
        // Nếu là phòng online (demo)
        setRooms([
          { physicalId: 101, location: "Zoom Meeting", capacity: "-", equipment: "Zoom", type: "ONLINE" },
          { physicalId: 102, location: "Teams Meeting", capacity: "-", equipment: "Microsoft Teams", type: "ONLINE" },
        ]);
      }
    } catch (err) {
      console.error("❌ Lỗi tải danh sách phòng:", err);
      setError("Không thể tải danh sách phòng trống (400 - dữ liệu sai định dạng).");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="available-rooms-container">
      <h2>Danh sách phòng trống</h2>
      <p>Chọn thời gian và tiêu chí để tìm phòng phù hợp</p>

      {/* Bộ lọc */}
      <div className="filter-form">
        <div className="form-row">
          {/* Thời gian bắt đầu */}
          <div className="form-group">
            <label>Thời gian bắt đầu *</label>
            <div className="datetime-picker-container">
              <Datetime
                value={formatDate(form.startTime)}
                onChange={(date) => handleDateTimeChange("startTime", date)}
                dateFormat="DD/MM/YYYY"
                timeFormat="HH:mm"
                inputProps={{
                  placeholder: "Chọn thời gian bắt đầu",
                  readOnly: true,
                }}
                closeOnSelect
              />
              <FaCalendarAlt className="input-icon" />
            </div>
          </div>

          {/* Thời gian kết thúc */}
          <div className="form-group">
            <label>Thời gian kết thúc *</label>
            <div className="datetime-picker-container">
              <Datetime
                value={formatDate(form.endTime)}
                onChange={(date) => handleDateTimeChange("endTime", date)}
                dateFormat="DD/MM/YYYY"
                timeFormat="HH:mm"
                inputProps={{
                  placeholder: "Chọn thời gian kết thúc",
                  readOnly: true,
                }}
                closeOnSelect
              />
              <FaCalendarAlt className="input-icon" />
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

        <button className="btn-search" onClick={fetchAvailableRooms} disabled={loading}>
          {loading ? "Đang tìm..." : "Tìm phòng trống"}
        </button>

        {error && <p className="error-message">{error}</p>}
      </div>

      {/* Danh sách phòng */}
      <div className="rooms-list">
        {rooms.length > 0 ? (
          rooms.map((room) => (
            <div key={room.physicalId} className="room-card">
              <h3>{room.location}</h3>
              <p>
                Sức chứa: {room.capacity} người <br />
                Trang thiết bị: {room.equipment}
              </p>
              <small>
                {moment(room.filteredStartTime).format("DD/MM/YYYY HH:mm")} -{" "}
                {moment(room.filteredEndTime).format("DD/MM/YYYY HH:mm")}
              </small>
              <button className="btn-select">Chọn phòng</button>
            </div>
          ))
        ) : (
          !loading && <p className="empty-state">Không có phòng nào phù hợp.</p>
        )}
      </div>
    </div>
  );
};

export default AvailableRooms;
