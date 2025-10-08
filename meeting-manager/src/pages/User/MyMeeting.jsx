// MyMeeting.jsx - Multi-step dialog + toast thông báo
import React, { useState } from "react";
import {
  initMeeting,
  createMeetingRoom,
  filterPhysicalRooms,
  assignPhysicalRoom,
} from "../../services/meetingServiceUser.js";
import { FaPlus } from "react-icons/fa";
import Datetime from "react-datetime";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../../assets/styles/UserCSS/MyMeeting.css";

const MyMeeting = () => {
  const [showModal, setShowModal] = useState(false);
  const [step, setStep] = useState(1); // 🔹 bước hiện tại: 1-init, 2-room, 3-assign
  const [meetingId, setMeetingId] = useState(null);
  const [roomId, setRoomId] = useState(null);
  const [suggestedRooms, setSuggestedRooms] = useState([]);

  const [form, setForm] = useState({
    title: "",
    startTime: "",
    endTime: "",
    roomType: "PHYSICAL",
    roomName: "",
    capacity: 1,
    selectedRoom: null,
  });

  // 🧭 Bước 1: Khởi tạo meeting
  const handleInitMeeting = async () => {
    try {
      const res = await initMeeting({
        title: form.title,
        startTime: form.startTime,
        endTime: form.endTime,
      });
      setMeetingId(res.meetingId);
      toast.success("✅ " + res.message);
      setStep(2);
    } catch (error) {
      console.error(error);
      toast.error("❌ Lỗi khi khởi tạo meeting!");
    }
  };

  // 🧭 Bước 2: Tạo meeting room
  const handleCreateRoom = async () => {
    try {
      const res = await createMeetingRoom({
        meetingId,
        type: form.roomType,
        roomName: form.roomName || "Conference Room A",
      });
      setRoomId(res.roomId);
      toast.success("✅ " + res.message);
      if (form.roomType === "PHYSICAL") setStep(3);
      else {
        toast.info("🎉 Meeting online đã tạo xong!");
        closeModal();
      }
    } catch (error) {
      console.error(error);
      toast.error("❌ Lỗi khi tạo meeting room!");
    }
  };

  // 🧭 Bước 3: Lọc & chọn phòng vật lý
  const fetchAvailableRooms = async () => {
    try {
      const res = await filterPhysicalRooms({
        roomId,
        capacity: form.capacity,
        startTime: form.startTime,
        endTime: form.endTime,
      });
      setSuggestedRooms(res);
      toast.info(`🔍 Tìm thấy ${res.length} phòng khả dụng`);
    } catch (error) {
      console.error(error);
      toast.error("❌ Lỗi khi tìm phòng khả dụng!");
    }
  };

  // 🧭 Gán phòng vật lý đã chọn
  const handleAssignRoom = async () => {
    try {
      if (!form.selectedRoom) {
        toast.warn("⚠️ Vui lòng chọn một phòng trước khi gán!");
        return;
      }
      await assignPhysicalRoom({
        roomId,
        physicalId: form.selectedRoom,
      });
      toast.success("✅ Gán phòng thành công!");
      closeModal();
    } catch (error) {
      console.error(error);
      toast.error("❌ Lỗi khi gán phòng!");
    }
  };

  // 🧩 Reset modal
  const closeModal = () => {
    setShowModal(false);
    setStep(1);
    setMeetingId(null);
    setRoomId(null);
    setForm({
      title: "",
      startTime: "",
      endTime: "",
      roomType: "PHYSICAL",
      roomName: "",
      capacity: 1,
      selectedRoom: null,
    });
    setSuggestedRooms([]);
  };

  return (
    <div className="my-meeting-container">
      <div className="user-header">
        <h2>My Meetings</h2>
        <button className="btn-add" onClick={() => setShowModal(true)}>
          <FaPlus /> Tạo Meeting
        </button>
      </div>

      {/* Modal 3 bước */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                {step === 1
                  ? "Bước 1: Khởi tạo Meeting"
                  : step === 2
                  ? "Bước 2: Tạo Meeting Room"
                  : "Bước 3: Chọn phòng vật lý"}
              </h3>
              <button className="close-btn" onClick={closeModal}>
                ×
              </button>
            </div>

            <div className="modal-body">
              {step === 1 && (
                <>
                  <div className="form-group">
                    <label>Tiêu đề *</label>
                    <input
                      type="text"
                      name="title"
                      placeholder="Nhập tiêu đề"
                      value={form.title}
                      onChange={(e) =>
                        setForm({ ...form, title: e.target.value })
                      }
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
                    value={form.startTime ? new Date(form.startTime) : null}
                    onChange={(date) =>
                      setForm({ ...form, startTime: date && date.toDate ? date.toDate().toISOString() : "" })
                    }
                    dateFormat="DD/MM/YYYY"
                    timeFormat="HH:mm"
                    closeOnClickOutside={true}      // 👈 Thêm dòng này (thoát khi click ra ngoài)
                    onBlur={(e) => e.preventDefault()} // 👈 Chặn bug focus
                    inputProps={{
                      placeholder: "Chọn ngày và giờ bắt đầu",
                      readOnly: true,               // 👈 Ngăn keyboard bật lên
                    }}
                  />
                  </div>

                  <div className="modal-footer">
                    <button className="btn-cancel" onClick={closeModal}>
                      Hủy
                    </button>
                    <button
                      className="btn-save"
                      disabled={!form.title || !form.startTime || !form.endTime}
                      onClick={handleInitMeeting}
                    >
                      Tiếp tục
                    </button>
                  </div>
                </>
              )}

              {step === 2 && (
                <>
                  <div className="form-group">
                    <label>Loại phòng *</label>
                    <select
                      name="roomType"
                      value={form.roomType}
                      onChange={(e) =>
                        setForm({ ...form, roomType: e.target.value })
                      }
                    >
                      <option value="PHYSICAL">Phòng vật lý</option>
                      <option value="ONLINE">Phòng online</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Tên phòng</label>
                    <input
                      type="text"
                      placeholder="Nhập tên phòng (tùy chọn)"
                      value={form.roomName}
                      onChange={(e) =>
                        setForm({ ...form, roomName: e.target.value })
                      }
                    />
                  </div>

                  <div className="modal-footer">
                    <button className="btn-cancel" onClick={closeModal}>
                      Hủy
                    </button>
                    <button className="btn-save" onClick={handleCreateRoom}>
                      Tạo Meeting Room
                    </button>
                  </div>
                </>
              )}

              {step === 3 && (
                <>
                  <div className="form-group">
                    <label>Sức chứa cần thiết *</label>
                    <input
                      type="number"
                      name="capacity"
                      value={form.capacity}
                      onChange={(e) =>
                        setForm({ ...form, capacity: e.target.value })
                      }
                    />
                  </div>

                  <button
                    className="btn-save"
                    style={{ marginBottom: "10px" }}
                    onClick={fetchAvailableRooms}
                  >
                    Tìm phòng khả dụng
                  </button>

                  {suggestedRooms.length > 0 && (
                    <div className="suggested-rooms">
                      <h4>Danh sách phòng khả dụng:</h4>
                      {suggestedRooms.map((r) => (
                        <div
                          key={r.physicalId}
                          className={`room-item ${
                            form.selectedRoom === r.physicalId
                              ? "selected"
                              : ""
                          }`}
                          onClick={() =>
                            setForm({ ...form, selectedRoom: r.physicalId })
                          }
                        >
                          <b>{r.location}</b> ({r.capacity} chỗ)
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="modal-footer">
                    <button className="btn-cancel" onClick={closeModal}>
                      Hủy
                    </button>
                    <button
                      className="btn-save"
                      disabled={!form.selectedRoom}
                      onClick={handleAssignRoom}
                    >
                      Gán phòng
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyMeeting;
