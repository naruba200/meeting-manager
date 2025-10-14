import React, { useState } from "react";
import { FaCalendarAlt, FaUsers, FaBuilding, FaVideo } from "react-icons/fa";
import Datetime from "react-datetime";
import "react-datetime/css/react-datetime.css";
import moment from "moment";
import "../../assets/styles/UserCSS/AvailableRooms.css";
import {
  filterAvailablePhysicalRooms,
  createMeetingRoomFromPhysical,
  createMeetingWithRoom,
} from "../../services/physicalRoomService.js";

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

  // --- Dialog tạo Meeting Room ---
  const [showDialog, setShowDialog] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [meetingRoomName, setMeetingRoomName] = useState("");
  const [creatingRoom, setCreatingRoom] = useState(false);
  const [createMessage, setCreateMessage] = useState("");

  // --- Dialog tạo Meeting ---
  const [showMeetingDialog, setShowMeetingDialog] = useState(false);
  const [meetingData, setMeetingData] = useState({ title: "", description: "" });
  const [creatingMeeting, setCreatingMeeting] = useState(false);
  const [meetingMessage, setMeetingMessage] = useState("");
  const [createdRoomId, setCreatedRoomId] = useState(null);

  // Xử lý thay đổi input form
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const formatDate = (date) => (date ? moment(date).format("DD/MM/YYYY HH:mm") : "");

  const handleDateTimeChange = (field, date) => {
    if (moment.isMoment(date)) {
      setForm((prev) => ({
        ...prev,
        [field]: date.format("YYYY-MM-DDTHH:mm:ss"),
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
        const data = await filterAvailablePhysicalRooms(
          form.startTime,
          form.endTime,
          form.participants
        );
        const filtered = data.filter((room) => room.capacity >= form.participants);
        setRooms(filtered);
      } else {
        setRooms([
          { physicalId: 101, location: "Zoom Meeting", capacity: "-", equipment: "Zoom" },
          { physicalId: 102, location: "Teams Meeting", capacity: "-", equipment: "Microsoft Teams" },
        ]);
      }
    } catch (err) {
      console.error("❌ Lỗi tải danh sách phòng:", err);
      setError("Không thể tải danh sách phòng trống.");
    } finally {
      setLoading(false);
    }
  };

  // Khi bấm chọn phòng
  const handleSelectRoom = (room) => {
    setSelectedRoom(room);
    setMeetingRoomName("");
    setCreateMessage("");
    setShowDialog(true);
  };

  // Gọi API tạo Meeting Room
  const handleCreateMeetingRoom = async () => {
    if (!meetingRoomName.trim()) {
      setCreateMessage("Vui lòng nhập tên phòng họp.");
      return;
    }

    setCreatingRoom(true);
    setCreateMessage("");

    try {
      const data = await createMeetingRoomFromPhysical(meetingRoomName, selectedRoom.physicalId);
      setCreateMessage(`✅ Tạo thành công: ${data.roomName}`);
      setCreatedRoomId(data.roomId);
      setShowMeetingDialog(true); // Mở dialog tạo meeting
    } catch (err) {
      console.error("❌ Lỗi tạo phòng họp:", err);
      setCreateMessage("❌ Không thể tạo phòng họp.");
    } finally {
      setCreatingRoom(false);
    }
  };

  // Gọi API tạo Meeting
  const handleCreateMeeting = async () => {
    if (!meetingData.title.trim()) {
      setMeetingMessage("Vui lòng nhập tiêu đề cuộc họp.");
      return;
    }

    setCreatingMeeting(true);
    setMeetingMessage("");

    try {
      const data = await createMeetingWithRoom(
        meetingData.title,
        meetingData.description,
        createdRoomId
      );
      console.log("✅ Meeting created:", data);

      // Hiển thị thông báo thành công
      setMeetingMessage(`✅ Tạo meeting thành công: ${data.title}`);

      // Đóng dialog sau 1.2 giây
      setTimeout(() => {
        setShowMeetingDialog(false);
        setShowDialog(false);
        setMeetingData({ title: "", description: "" });
        setMeetingMessage("");
        alert("Tạo cuộc họp thành công!");
      }, 1200);
    } catch (err) {
      console.error("❌ Lỗi tạo meeting:", err);
      setMeetingMessage("❌ Không thể tạo meeting.");
    } finally {
      setCreatingMeeting(false);
    }
  };

  return (
    <div className="available-rooms-container">
      <h2>Danh sách phòng trống</h2>
      <p>Chọn thời gian và tiêu chí để tìm phòng phù hợp</p>

      {/* Bộ lọc */}
      <div className="filter-form">
        <div className="form-row">
          <div className="form-group">
            <label>Thời gian bắt đầu *</label>
            <div className="datetime-picker-container">
              <Datetime
                value={formatDate(form.startTime)}
                onChange={(date) => handleDateTimeChange("startTime", date)}
                dateFormat="DD/MM/YYYY"
                timeFormat="HH:mm"
                inputProps={{ placeholder: "Chọn thời gian bắt đầu", readOnly: true }}
                closeOnSelect
              />
              <FaCalendarAlt className="input-icon" />
            </div>
          </div>

          <div className="form-group">
            <label>Thời gian kết thúc *</label>
            <div className="datetime-picker-container">
              <Datetime
                value={formatDate(form.endTime)}
                onChange={(date) => handleDateTimeChange("endTime", date)}
                dateFormat="DD/MM/YYYY"
                timeFormat="HH:mm"
                inputProps={{ placeholder: "Chọn thời gian kết thúc", readOnly: true }}
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
              <button className="btn-select" onClick={() => handleSelectRoom(room)}>
                Chọn phòng
              </button>
            </div>
          ))
        ) : (
          !loading && <p className="empty-state">Không có phòng nào phù hợp.</p>
        )}
      </div>

      {/* Dialog 1: Đặt phòng họp */}
      {showDialog && (
        <div className="dialog-overlay">
          <div className="dialog-box">
            <h3>Đặt phòng họp</h3>
            <p>Phòng: <strong>{selectedRoom?.location}</strong></p>
            <div className="form-group">
              <label>Tên phòng họp</label>
              <input
                type="text"
                value={meetingRoomName}
                onChange={(e) => setMeetingRoomName(e.target.value)}
                placeholder="Nhập tên phòng họp..."
              />
            </div>

            {createMessage && <p className="status-message">{createMessage}</p>}

            <div className="dialog-actions">
              <button onClick={() => setShowDialog(false)}>Đóng</button>
              <button onClick={handleCreateMeetingRoom} disabled={creatingRoom}>
                {creatingRoom ? "Đang tạo..." : "Tạo phòng họp"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dialog 2: Tạo meeting */}
      {showMeetingDialog && (
        <div className="dialog-overlay">
          <div className="dialog-box">
            <h3>Tạo cuộc họp</h3>
            <div className="form-group">
              <label>Tiêu đề cuộc họp *</label>
              <input
                type="text"
                value={meetingData.title}
                onChange={(e) => setMeetingData({ ...meetingData, title: e.target.value })}
                placeholder="Nhập tiêu đề..."
              />
            </div>
            <div className="form-group">
              <label>Mô tả</label>
              <textarea
                value={meetingData.description}
                onChange={(e) => setMeetingData({ ...meetingData, description: e.target.value })}
                placeholder="Nhập mô tả..."
              />
            </div>

            {meetingMessage && <p className="status-message">{meetingMessage}</p>}

            <div className="dialog-actions">
              <button
                onClick={() => {
                  setShowMeetingDialog(false);
                  setShowDialog(false);
                }}
              >
                Đóng
              </button>
              <button onClick={handleCreateMeeting} disabled={creatingMeeting}>
                {creatingMeeting ? "Đang tạo..." : "Tạo cuộc họp"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AvailableRooms;
