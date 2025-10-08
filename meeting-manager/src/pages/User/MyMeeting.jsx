import React, { useState } from "react";
import { FaPlus, FaSearch } from "react-icons/fa";
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

  /** 🟩 STEP 1: Khởi tạo Meeting */
  const handleInitMeeting = async () => {
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
    }
  };

  /** 🟩 STEP 2: Tạo Meeting Room */
  const handleCreateRoom = async () => {
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
      // Sau khi có roomId → qua bước lọc phòng
      setStep(3);
      await handleFilterRooms(res.roomId);
    } catch (error) {
      console.error("Error creating room:", error);
      alert("❌ Lỗi khi tạo phòng meeting!");
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
    } catch (error) {
      console.error("Error assigning room:", error);
      alert("❌ Lỗi khi gán phòng!");
    }
  };

  return (
    <div className="my-meeting-container">
      <div className="user-header">
        <div className="header-title">
          <h2>My Meetings</h2>
          <p>Manage your created and joined meetings</p>
        </div>
        <button
          className="btn-add"
          onClick={() => {
            setStep(1);
            setShowModal(true);
          }}
        >
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

      {/* 🧩 Multi-step modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                {step === 1
                  ? "Bước 1: Khởi tạo Meeting"
                  : step === 2
                  ? "Bước 2: Tạo Meeting Room"
                  : "Bước 3: Gán phòng vật lý"}
              </h3>
              <button className="close-btn" onClick={() => setShowModal(false)}>
                ×
              </button>
            </div>

            <div className="modal-body">
              {/* STEP 1 */}
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
                    <Datetime
                      value={form.startTime ? new Date(form.startTime) : null}
                      onChange={(date) =>
                        setForm({
                          ...form,
                          startTime: date.toDate().toISOString(),
                        })
                      }
                      dateFormat="DD/MM/YYYY"
                      timeFormat="HH:mm"
                    />
                  </div>
                  <div className="form-group">
                    <label>Thời gian kết thúc *</label>
                    <Datetime
                      value={form.endTime ? new Date(form.endTime) : null}
                      onChange={(date) =>
                        setForm({
                          ...form,
                          endTime: date.toDate().toISOString(),
                        })
                      }
                      dateFormat="DD/MM/YYYY"
                      timeFormat="HH:mm"
                    />
                  </div>
                </>
              )}

              {/* STEP 2 */}
              {step === 2 && (
                <>
                  <p>✅ Meeting đã khởi tạo (ID: {meetingId})</p>
                  <div className="form-group">
                    <label>Loại phòng *</label>
                    <select
                      name="roomType"
                      value={form.roomType}
                      onChange={handleFormChange}
                    >
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
                      />
                    </div>
                  )}
                </>
              )}

              {/* STEP 3 */}
              {step === 3 && (
                <>
                  <p>✅ Room đã tạo (ID: {roomId})</p>
                  <p>🔍 Chọn phòng vật lý khả dụng:</p>
                  <div className="available-rooms">
                    {availableRooms.length === 0 ? (
                      <p>Không có phòng trống phù hợp.</p>
                    ) : (
                      availableRooms.map((room) => (
                        <div
                          key={room.physicalId}
                          className={`room-item ${
                            selectedPhysicalRoom === room.physicalId
                              ? "selected"
                              : ""
                          }`}
                          onClick={() =>
                            setSelectedPhysicalRoom(room.physicalId)
                          }
                        >
                          <b>{room.location}</b> ({room.capacity} chỗ)
                        </div>
                      ))
                    )}
                  </div>
                </>
              )}
            </div>

            <div className="modal-footer">
              {step === 1 && (
                <button
                  className="btn-save"
                  disabled={!form.title || !form.startTime || !form.endTime}
                  onClick={handleInitMeeting}
                >
                  Tiếp tục
                </button>
              )}
              {step === 2 && (
                <button className="btn-save" onClick={handleCreateRoom}>
                  Tạo phòng
                </button>
              )}
              {step === 3 && (
                <button
                  className="btn-save"
                  disabled={!selectedPhysicalRoom}
                  onClick={handleAssignRoom}
                >
                  Gán phòng
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
