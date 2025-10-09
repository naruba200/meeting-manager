import React, { useState, useEffect } from "react";
import { FaPlus, FaSearch, FaCalendarAlt } from "react-icons/fa";
import "../../assets/styles/UserCSS/MyMeeting.css";
import {
  initMeeting,
  createMeetingRoom,
  filterPhysicalRooms,
  assignPhysicalRoom,
  getMeetingsByOrganizer,
} from "../../services/meetingServiceUser.js";
import Datetime from "react-datetime";
import "react-datetime/css/react-datetime.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const MyMeeting = () => {
  const [search, setSearch] = useState("");
  const [meetings, setMeetings] = useState([]);
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

  // 🟢 Lấy organizerId (chính là userId)
  const user = JSON.parse(localStorage.getItem("user"));
  const organizerId = user?.userId;

  // 🟢 Lấy danh sách meeting
  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        if (organizerId) {
          const data = await getMeetingsByOrganizer(organizerId);
          setMeetings(data);
        }
      } catch (error) {
        toast.error("❌ Lỗi khi tải danh sách meetings!");
        console.error("Error fetching meetings:", error);
      }
    };
    fetchMeetings();
  }, [organizerId]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const isStepValid = () => {
    if (step === 1) return form.title && form.startTime && form.endTime;
    if (step === 2) return true;
    if (step === 3) return selectedPhysicalRoom;
    return false;
  };

  // 🟢 STEP 1: Khởi tạo Meeting
  const handleInitMeeting = async () => {
    setIsLoading(true);
    try {
      const res = await initMeeting({
        title: form.title,
        startTime: form.startTime,
        endTime: form.endTime,
        organizerId: organizerId,
      });
      toast.success(res.message);
      setMeetingId(res.meetingId);
      setStep(2);
    } catch (error) {
      toast.error("❌ Lỗi khi khởi tạo meeting!");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // 🟢 STEP 2: Tạo Meeting Room
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
      toast.success(res.message);
      setRoomId(res.roomId);
      setStep(3);
      await handleFilterRooms(res.roomId);
    } catch (error) {
      toast.error("❌ Lỗi khi tạo phòng!");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // 🟢 STEP 3a: Lọc phòng vật lý khả dụng
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
      toast.error("❌ Lỗi khi lọc phòng khả dụng!");
      console.error(error);
    }
  };

  // 🟢 STEP 3b: Gán phòng vật lý
  const handleAssignRoom = async () => {
    setIsLoading(true);
    try {
      if (!selectedPhysicalRoom) {
        toast.warning("Vui lòng chọn một phòng!");
        return;
      }
      const res = await assignPhysicalRoom({
        roomId,
        physicalId: selectedPhysicalRoom,
      });
      toast.success(res.message || "✅ Đặt phòng thành công!");
      resetModal();
    } catch (error) {
      toast.error("❌ Lỗi khi gán phòng!");
      console.error(error);
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
    resetModal();
    setTimeout(() => setShowModal(true), 0);
  };

  const handleDateTimeChange = (field, momentDate) => {
    if (momentDate && momentDate.isValid()) {
      setForm({ ...form, [field]: momentDate.toDate().toISOString() });
    } else {
      setForm({ ...form, [field]: "" });
    }
  };

  const formatDate = (isoString) => (isoString ? new Date(isoString) : null);

  const filteredMeetings = meetings.filter((m) =>
    m.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="my-meeting-container">
      <ToastContainer position="top-right" autoClose={2500} hideProgressBar />
      <div className="user-header">
        <div className="header-title">
          <h2>My Meetings</h2>
          <p>Danh sách các cuộc họp bạn đã tạo</p>
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

      {/* 🟢 Danh sách meetings */}
      <div className="meetings-list">
        {filteredMeetings.length === 0 ? (
          <div className="empty-state">
            <h3>Chưa có meeting nào</h3>
            <p>Tạo meeting đầu tiên của bạn ngay bây giờ!</p>
          </div>
        ) : (
          filteredMeetings.map((meeting) => (
            <div key={meeting.meetingId} className="meeting-item">
              <h4>{meeting.title}</h4>
              <p>
                <strong>Bắt đầu:</strong>{" "}
                {new Date(meeting.startTime).toLocaleString()}
              </p>
              <p>
                <strong>Kết thúc:</strong>{" "}
                {new Date(meeting.endTime).toLocaleString()}
              </p>
              <p>
                <strong>Phòng:</strong> {meeting.roomName}
              </p>
              <p>
                <strong>Trạng thái:</strong> {meeting.status}
              </p>
            </div>
          ))
        )}
      </div>

      {/* 🟢 Multi-step modal */}
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
              <div className="step-progress">
                <div className={`step-item ${step >= 1 ? "active" : ""}`}>1</div>
                <div className={`step-item ${step >= 2 ? "active" : ""}`}>2</div>
                <div className={`step-item ${step >= 3 ? "active" : ""}`}>3</div>
              </div>

              {/* 🟢 STEP 1 */}
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
                        onChange={(date) =>
                          handleDateTimeChange("startTime", date)
                        }
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
                  <div className="form-group">
                    <label>Thời gian kết thúc *</label>
                    <div className="datetime-picker-container">
                      <Datetime
                        value={formatDate(form.endTime)}
                        onChange={(date) =>
                          handleDateTimeChange("endTime", date)
                        }
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
                </>
              )}

              {/* 🟢 STEP 2 */}
              {step === 2 && (
                <>
                  <p style={{ color: "green", fontWeight: "600" }}>
                    ✅ Meeting đã khởi tạo (ID: {meetingId})
                  </p>
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
                        min={1}
                      />
                    </div>
                  )}
                </>
              )}

              {/* 🟢 STEP 3 */}
              {step === 3 && (
                <>
                  <p style={{ color: "green", fontWeight: "600" }}>
                    ✅ Room đã tạo (ID: {roomId})
                  </p>
                  <p style={{ fontWeight: "600" }}>🔍 Chọn phòng vật lý khả dụng:</p>
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
                            selectedPhysicalRoom === room.physicalId
                              ? "selected"
                              : ""
                          }`}
                          onClick={() =>
                            setSelectedPhysicalRoom(room.physicalId)
                          }
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
                <button
                  className="btn-save"
                  disabled={isLoading}
                  onClick={handleCreateRoom}
                >
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
