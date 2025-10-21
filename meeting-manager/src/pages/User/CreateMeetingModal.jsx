import React, { useState, useEffect } from "react";
import { FaCalendarAlt } from "react-icons/fa";
import moment from "moment-timezone";
import Datetime from "react-datetime";
import "react-datetime/css/react-datetime.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  initMeeting,
  createMeetingRoom,
  filterPhysicalRooms,
  assignPhysicalRoom,
 getMeetingsByOrganizer,
} from "../../services/meetingServiceUser.js";

const CreateMeeting = ({ showModal, setShowModal, organizerId, setMeetings }) => {
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
    roomType: "PHYSICAL",
    roomName: "",
    participants: 1,
  });

  useEffect(() => {
    if (showModal && form.roomType === "PHYSICAL" && roomId && form.startTime && form.endTime) {
      const filterData = {
        roomId,
        capacity: form.participants,
        startTime: form.startTime,
        endTime: form.endTime,
      };
      filterPhysicalRooms(filterData).then(setAvailableRooms).catch((error) => {
        toast.error("❌ Error filtering rooms!");
        console.error(error);
      });
    }
  }, [form.roomType, form.startTime, form.endTime, roomId, showModal]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleDateTimeChange = (field, momentDate) => {
    if (momentDate && momentDate.isValid()) {
      const vnTime = momentDate.tz('Asia/Ho_Chi_Minh');
      setForm({ ...form, [field]: vnTime.format('YYYY-MM-DDTHH:mm:ss') });
    } else {
      setForm({ ...form, [field]: "" });
    }
  };

  const formatDate = (dateString) => {
    if (dateString) {
      return moment.tz(dateString, 'YYYY-MM-DDTHH:mm:ss', 'Asia/Ho_Chi_Minh');
    }
    return null;
  };

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
      toast.error("❌ Error creating meeting!");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateRoom = async () => {
    setIsLoading(true);
    try {
      const roomName = form.roomName.trim() || (form.roomType === "PHYSICAL" ? "Conference Room Default" : "Online Meeting Default");
      const res = await createMeetingRoom({
        meetingId,
        type: form.roomType,
        roomName: roomName,
      });
      toast.success(res.message);
      setRoomId(res.roomId);
      setStep(3);
    } catch (error) {
      toast.error("❌ Error creating room!");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssignRoom = async () => {
    setIsLoading(true);
    try {
      if (!selectedPhysicalRoom && form.roomType === "PHYSICAL") {
        toast.warning("Please select a room!");
        return;
      }
      if (form.roomType === "PHYSICAL") {
        await assignPhysicalRoom({
          roomId,
          physicalId: selectedPhysicalRoom || availableRooms[0]?.physicalId,
        });
      }
      toast.success("✅ Meeting created successfully!");
      const updatedMeetings = await getMeetingsByOrganizer(organizerId);
      setMeetings(updatedMeetings);
      resetModal();
    } catch (error) {
      toast.error("❌ Error assigning room!");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetModal = () => {
    setShowModal(false);
    setStep(1);
    setForm({
      title: "",
      startTime: "",
      endTime: "",
      participants: 1,
      roomType: "PHYSICAL",
      roomName: "",
    });
    setMeetingId(null);
    setRoomId(null);
    setAvailableRooms([]);
    setSelectedPhysicalRoom(null);
  };

  const isStepValid = () => {
    if (step === 1) return form.title && form.startTime && form.endTime;
    if (step === 2) return form.roomType && form.roomName.trim() !== "" && form.participants > 0;
    if (step === 3) return form.roomType === "ONLINE" || selectedPhysicalRoom;
    return false;
  };

  const renderCreateSteps = () => (
    <>
      {step === 1 && (
        <>
          <div className="user-form-group">
            <label>Title *</label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleFormChange}
              placeholder="Enter title"
            />
          </div>
          <div className="user-form-group">
            <label>Start time *</label>
            <div className="datetime-picker-container">
              <Datetime
                value={formatDate(form.startTime)}
                onChange={(date) => handleDateTimeChange("startTime", date)}
                dateFormat="DD/MM/YYYY"
                timeFormat="HH:mm"
                inputProps={{
                  placeholder: "Select start time",
                  readOnly: true,
                }}
                closeOnSelect
              />
              <FaCalendarAlt className="input-icon" />
            </div>
          </div>
          <div className="user-form-group">
            <label>End time *</label>
            <div className="datetime-picker-container">
              <Datetime
                value={formatDate(form.endTime)}
                onChange={(date) => handleDateTimeChange("endTime", date)}
                dateFormat="DD/MM/YYYY"
                timeFormat="HH:mm"
                inputProps={{
                  placeholder: "Select end time",
                  readOnly: true,
                }}
                closeOnSelect
              />
              <FaCalendarAlt className="input-icon" />
            </div>
          </div>
        </>
      )}
      {step === 2 && (
        <>
          <div className="success-message">
            ✅ Meeting created (ID: {meetingId})
          </div>
          <div className="user-form-group">
            <label>Số lượng người tham gia *</label>
            <input
              type="number"
              name="participants"
              value={form.participants}
              onChange={handleFormChange}
              placeholder="Enter number of participants"
              min="1"
            />
          </div>
          <div className="user-form-group">
            <label>Room type *</label>
            <select
              name="roomType"
              value={form.roomType}
              onChange={handleFormChange}
            >
              <option value="PHYSICAL">Physical room</option>
              <option value="ONLINE">Online room</option>
            </select>
          </div>
          <div className="user-form-group">
            <label>Room name *</label>
            <input
              type="text"
              name="roomName"
              value={form.roomName}
              onChange={handleFormChange}
              placeholder="Enter room name (e.g., Conference Room Test)"
            />
          </div>
        </>
      )}
      {step === 3 && (
        <>
          <div className="success-message">
            ✅ Room created (ID: {roomId}) - Name: {form.roomName || "Default"}
          </div>
          {form.roomType === "PHYSICAL" && (
            <>
              <p className="info-label">🔍 Select an available physical room:</p>
              <div className="rooms-list">
                {availableRooms.length === 0 ? (
                  <div className="no-rooms-available">
                    No suitable rooms available.
                  </div>
                ) : (
                  availableRooms.map((room) => (
                    <div
                      key={room.physicalId}
                      className={`room-item ${selectedPhysicalRoom === room.physicalId ? "selected" : ""}`}
                      onClick={() => setSelectedPhysicalRoom(room.physicalId)}
                    >
                      <div className="room-info">
                        <h5>{room.location}</h5>
                        <p>({room.capacity} seats)</p>
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
          {form.roomType === "ONLINE" && (
            <div className="success-message">
              ✅ Online room is ready, no physical room assignment needed.
            </div>
          )}
        </>
      )}
    </>
  );

  return (
    <>
      <ToastContainer position="top-right" autoClose={2500} hideProgressBar />
      {showModal && (
        <div className="modal-overlay" onClick={resetModal}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Step {step}: {step === 1 ? "Create Meeting" : step === 2 ? "Create Meeting Room" : "Assign Physical Room"}</h3>
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
              {renderCreateSteps()}
            </div>

            <div className="modal-footer">
              <button className="btn-cancel" onClick={resetModal}>
                Cancel
              </button>
              {step === 1 && (
                <button
                  className="btn-save"
                  disabled={!isStepValid() || isLoading}
                  onClick={handleInitMeeting}
                >
                  {isLoading ? "Processing..." : "Continue"}
                </button>
              )}
              {step === 2 && (
                <button
                  className="btn-save"
                  disabled={!isStepValid() || isLoading}
                  onClick={handleCreateRoom}
                >
                  {isLoading ? "Processing..." : "Create Room"}
                </button>
              )}
              {step === 3 && (
                <button
                  className="btn-save"
                  disabled={!isStepValid() || isLoading}
                  onClick={handleAssignRoom}
                >
                  {isLoading ? "Processing..." : "Finish"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CreateMeeting;