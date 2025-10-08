import React, { useState } from "react";
import { FaPlus, FaSearch, FaCalendarAlt } from "react-icons/fa";
import "../../assets/styles/UserCSS/MyMeeting.css";
import {
  initMeeting,
  createMeetingRoom,
  filterPhysicalRooms,
  assignPhysicalRoom,
} from "../../services/meetingServiceUser.js";
import Datetime from "react-datetime";
import "react-datetime/css/react-datetime.css";

const MyMeeting = () => {
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [step, setStep] = useState(1);
  const [meetingId, setMeetingId] = useState(null);
  const [roomId, setRoomId] = useState(null);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [selectedPhysicalRoom, setSelectedPhysicalRoom] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const [form, setForm] = useState({
    title: "",
    startTime: "",
    endTime: "",
    participants: 1,
    roomType: "PHYSICAL",
  });

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  // Validation helper
  const isStepValid = () => {
    if (step === 1) return form.title && form.startTime && form.endTime;
    if (step === 2) return true;
    if (step === 3) return selectedPhysicalRoom;
    return false;
  };

  /** 🟩 STEP 1: Khởi tạo Meeting */
  const handleInitMeeting = async () => {
    setIsLoading(true);
    try {
      const res = await initMeeting({
        title: form.title,
        startTime: form.startTime,
        endTime: form.endTime,
      });
      alert(res.message);
      setMeetingId(res.meetingId);
      setStep(2);
    } catch (error) {
      console.error("Error initializing meeting:", error);
      alert("❌ Lỗi khi khởi tạo meeting!");
    } finally {
      setIsLoading(false);
    }
  };

  /** 🟩 STEP 2: Tạo Meeting Room */
  const handleCreateRoom = async () => {
    setIsLoading(true);
    try {
      const res = await createMeetingRoom({
        meetingId,
        type: form.roomType,
        roomName:
          form.roomType === "PHYSICAL"
            ? "Conference Room A"
            : "Online Meeting Room",
      });
      alert(res.message);
      setRoomId(res.roomId);
      setStep(3);
      await handleFilterRooms(res.roomId);
    } catch (error) {
      console.error("Error creating room:", error);
      alert("❌ Lỗi khi tạo phòng meeting!");
    } finally {
      setIsLoading(false);
    }
  };

  /** 🟩 STEP 3a: Lọc phòng vật lý khả dụng */
  const handleFilterRooms = async (roomIdParam) => {
    try {
      const filterData = {
        roomId: roomIdParam,
        capacity: form.participants,
        startTime: form.startTime,
        endTime: form.endTime,
      };
      const rooms = await filterPhysicalRooms(filterData);
      setAvailableRooms(rooms);
    } catch (error) {
      console.error("Error filtering rooms:", error);
      alert("❌ Không thể tải danh sách phòng!");
    }
  };

  /** 🟩 STEP 3b: Gán phòng vật lý */
  const handleAssignRoom = async () => {
    setIsLoading(true);
    try {
      if (!selectedPhysicalRoom) {
        alert("Vui lòng chọn một phòng!");
        return;
      }

      const res = await assignPhysicalRoom({
        roomId,
        physicalId: selectedPhysicalRoom,
      });

      alert(res.message || "✅ Đặt phòng thành công!");
      resetModal();
    } catch (error) {
      console.error("Error assigning room:", error);
      alert("❌ Lỗi khi gán phòng!");
    } finally {
      setIsLoading(false);
    }
  };

  const resetModal = () => {
    setShowModal(false);
    setStep(1);
    setMeetingId(null);
    setRoomId(null);
    setAvailableRooms([]);
    setSelectedPhysicalRoom(null);
    setForm({
      title: "",
      startTime: "",
      endTime: "",
      participants: 1,
      roomType: "PHYSICAL",
    });
  };

  const handleOpenModal = () => {
    // Ensure reset before opening
    resetModal();
    setTimeout(() => setShowModal(true), 0);
  };

  const handleDateTimeChange = (field, momentDate) => {
    if (momentDate && momentDate.isValid()) {
      // Convert moment to ISO string
      setForm({ ...form, [field]: momentDate.toDate().toISOString() });
    } else {
      // Clear if invalid
      setForm({ ...form, [field]: "" });
    }
  };

  // Format display value for Datetime component
  const formatDate = (isoString) => {
    if (!isoString) return null;
    return new Date(isoString);
  };

  return (
    <div className="my-meeting-container">
      <div className="user-header">
        <div className="header-title">
          <h2>My Meetings</h2>
          <p>Manage your created and joined meetings</p>
        </div>
        <button className="btn-add" onClick={handleOpenModal}>
          <FaPlus /> Tạo Meeting
        </button>
      </div>

      <div className="search-bar">
        <FaSearch className="search-icon" />
        <input
          type="text"
          placeholder="Tìm kiếm meeting..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Empty State */}
      <div className="meetings-list">
        <div className="empty-state">
          <h3>Chưa có meeting nào</h3>
          <p>Tạo meeting đầu tiên của bạn ngay bây giờ!</p>
        </div>
      </div>

      {/* Multi-step modal */}
      {showModal && (
        <div className="modal-overlay" onClick={resetModal}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                {step === 1
                  ? "Bước 1: Khởi tạo Meeting"
                  : step === 2
                  ? "Bước 2: Tạo Meeting Room"
                  : "Bước 3: Gán phòng vật lý"}
              </h3>
              <button className="close-btn" onClick={resetModal}>
                ×
              </button>
            </div>

            <div className="modal-body">
              {/* Progress Bar */}
              <div className="step-progress">
                <div className={`step-item ${step >= 1 ? 'active' : ''}`}>1</div>
                <div className={`step-item ${step >= 2 ? 'active' : ''}`}>2</div>
                <div className={`step-item ${step >= 3 ? 'active' : ''}`}>3</div>
              </div>

              {/* STEP 1 - Enhanced react-datetime with icon */}
              {step === 1 && (
                <>
                  <div className="form-group">
                    <label>Tiêu đề *</label>
                    <input
                      type="text"
                      name="title"
                      value={form.title}
                      onChange={handleFormChange}
                      placeholder="Nhập tiêu đề"
                    />
                  </div>
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
                          readOnly: true, // Prevent typing, force picker
                        }}
                        closeOnSelect={true}
                        isValidDate={(current) => {
                          // Optional: Disable past dates
                          return current.isAfter(new Date());
                        }}
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
                        inputProps={{
                          placeholder: "Chọn thời gian kết thúc",
                          readOnly: true,
                        }}
                        closeOnSelect={true}
                        isValidDate={(current) => {
                          return current.isAfter(new Date());
                        }}
                      />
                      <FaCalendarAlt className="input-icon" />
                    </div>
                  </div>
                </>
              )}

              {/* STEP 2 */}
              {step === 2 && (
                <>
                  <p style={{ color: 'green', fontWeight: '600' }}>✅ Meeting đã khởi tạo (ID: {meetingId})</p>
                  <div className="form-group">
                    <label>Loại phòng *</label>
                    <select name="roomType" value={form.roomType} onChange={handleFormChange}>
                      <option value="PHYSICAL">Phòng vật lý</option>
                      <option value="ONLINE">Phòng online</option>
                    </select>
                  </div>
                  {form.roomType === "PHYSICAL" && (
                    <div className="form-group">
                      <label>Số lượng người tham gia *</label>
                      <input
                        type="number"
                        name="participants"
                        value={form.participants}
                        onChange={handleFormChange}
                        min={1}
                      />
                    </div>
                  )}
                </>
              )}

              {/* STEP 3 */}
              {step === 3 && (
                <>
                  <p style={{ color: 'green', fontWeight: '600' }}>✅ Room đã tạo (ID: {roomId})</p>
                  <p style={{ fontWeight: '600' }}>🔍 Chọn phòng vật lý khả dụng:</p>
                  <div className="rooms-list">
                    {availableRooms.length === 0 ? (
                      <div className="no-rooms-available">
                        Không có phòng trống phù hợp.
                      </div>
                    ) : (
                      availableRooms.map((room) => (
                        <div
                          key={room.physicalId}
                          className={`room-item ${
                            selectedPhysicalRoom === room.physicalId ? "selected" : ""
                          }`}
                          onClick={() => setSelectedPhysicalRoom(room.physicalId)}
                        >
                          <div className="room-info">
                            <h5>{room.location}</h5>
                            <p>({room.capacity} chỗ)</p>
                          </div>
                          {selectedPhysicalRoom === room.physicalId && (
                            <span className="selected-indicator">✓</span>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </>
              )}
            </div>

            <div className="modal-footer">
              <button className="btn-cancel" onClick={resetModal}>
                Hủy
              </button>
              {step === 1 && (
                <button
                  className="btn-save"
                  disabled={!isStepValid() || isLoading}
                  onClick={handleInitMeeting}
                >
                  {isLoading ? "Đang xử lý..." : "Tiếp tục"}
                </button>
              )}
              {step === 2 && (
                <button className="btn-save" disabled={isLoading} onClick={handleCreateRoom}>
                  {isLoading ? "Đang xử lý..." : "Tạo phòng"}
                </button>
              )}
              {step === 3 && (
                <button
                  className="btn-save"
                  disabled={!isStepValid() || isLoading}
                  onClick={handleAssignRoom}
                >
                  {isLoading ? "Đang xử lý..." : "Gán phòng"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyMeeting;