import React, { useState, useEffect } from "react";
import { FaPlus, FaSearch, FaCalendarAlt, FaCheckCircle, FaClock, FaEye, FaEdit, FaTrash } from "react-icons/fa";
import moment from "moment-timezone"; // Import moment-timezone to handle Asia/Ho_Chi_Minh timezone
import "../../assets/styles/UserCSS/MyMeeting.css";
import {
  initMeeting,
  createMeetingRoom,
  filterPhysicalRooms,
  assignPhysicalRoom,
  getMeetingsByOrganizer,
  updateMeeting,  // ← Keep for edit
  cancelMeeting,
} from "../../services/meetingServiceUser.js";
import Datetime from "react-datetime";
import "react-datetime/css/react-datetime.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const MyMeeting = () => {
  const [search, setSearch] = useState("");
  const [meetings, setMeetings] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [step, setStep] = useState(1); // 🟢 Only for create mode
  const [meetingId, setMeetingId] = useState(null);
  const [roomId, setRoomId] = useState(null);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [selectedPhysicalRoom, setSelectedPhysicalRoom] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isViewMode, setIsViewMode] = useState(false); // 🟢 For view/edit
  const [isCreateMode, setIsCreateMode] = useState(false); // 🟢 Differentiate create vs edit/view

  const [form, setForm] = useState({
    title: "",
    startTime: "",
    endTime: "",
    participants: 1,
    roomType: "PHYSICAL",
    roomName: "",
    status: "",
  });

  // 🟢 Get organizerId (which is userId)
  const user = JSON.parse(localStorage.getItem("user"));
  const organizerId = user?.userId;

  // 🟢 Get meeting list
  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        if (organizerId) {
          const data = await getMeetingsByOrganizer(organizerId);
          setMeetings(data);
        }
      } catch (error) {
        toast.error("❌ Error loading meetings!");
        console.error("Error fetching meetings:", error);
      }
    };
    fetchMeetings();
  }, [organizerId]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  // 🟢 Open modal: create (3 steps), view (single), edit (single)
  const handleOpenModal = (meeting = null, viewMode = false) => {
    if (meeting) {
      // Edit or View mode
      setIsCreateMode(false);
      setIsViewMode(viewMode);
      setForm({
        title: meeting.title,
        startTime: meeting.startTime,
        endTime: meeting.endTime,
        participants: meeting.participants || 1,
        roomType: meeting.roomType || "PHYSICAL",
        roomName: meeting.roomName || "",
        status: meeting.status || "",
      });
      setMeetingId(meeting.meetingId);
      setRoomId(meeting.roomId);
      setSelectedPhysicalRoom(meeting.physicalRoomId || null);
      if (meeting.roomType === "PHYSICAL") {
        loadAvailableRooms(meeting);
      }
    } else {
      // Create mode
      setIsCreateMode(true);
      setIsViewMode(false);
      setForm({
        title: "",
        startTime: "",
        endTime: "",
        participants: 1,
        roomType: "PHYSICAL",
        roomName: "",
        status: "",
      });
      setMeetingId(null);
      setRoomId(null);
      setSelectedPhysicalRoom(null);
      setAvailableRooms([]);
      setStep(1);
    }
    setIsLoading(false);
    setTimeout(() => setShowModal(true), 0);
  };

  // 🟢 Load available rooms for edit/view
  const loadAvailableRooms = async (meeting) => {
    try {
      const filterData = {
        roomId: meeting.roomId,
        capacity: meeting.participants,
        startTime: meeting.startTime,
        endTime: meeting.endTime,
      };
      const rooms = await filterPhysicalRooms(filterData);
      setAvailableRooms(rooms);
    } catch (error) {
      toast.error("❌ Error loading rooms!");
      console.error(error);
    }
  };

  // 🟢 Refilter rooms for edit (if changed)
  useEffect(() => {
    if (showModal && !isCreateMode && !isViewMode && form.roomType === "PHYSICAL" && roomId && form.startTime && form.endTime) {
      const filterData = {
        roomId,
        capacity: form.participants,
        startTime: form.startTime,
        endTime: form.endTime,
      };
      filterPhysicalRooms(filterData).then(setAvailableRooms).catch(console.error);
    }
  }, [form.roomType, form.participants, form.startTime, form.endTime, roomId, showModal, isCreateMode, isViewMode]);

  // 🟢 STEP 1: Initialize Meeting (create only)
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

  // 🟢 STEP 2: Create Meeting Room (create only)
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
      if (form.roomType === "PHYSICAL") {
        await handleFilterRooms(res.roomId);
      }
    } catch (error) {
      toast.error("❌ Error creating room!");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // 🟢 STEP 3: Assign physical room (create only)
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
      toast.error("❌ Error filtering available rooms!");
      console.error(error);
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

  // 🟢 Update meeting (for edit)
  const handleUpdateMeeting = async () => {
    setIsLoading(true);
    try {
      await updateMeeting(meetingId, {
        title: form.title,
        startTime: form.startTime,
        endTime: form.endTime,
      });

      if (form.roomType === "PHYSICAL" && selectedPhysicalRoom) {
        await assignPhysicalRoom({
          roomId,
          physicalId: selectedPhysicalRoom,
        });
      }

      toast.success("✅ Meeting updated successfully!");
      const updatedMeetings = await getMeetingsByOrganizer(organizerId);
      setMeetings(updatedMeetings);
      resetModal();
    } catch (error) {
      toast.error("❌ Error updating meeting!");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // 🟢 Delete Meeting
  const handleDeleteMeeting = async (meetingId) => {
    if (!window.confirm("Are you sure you want to delete this meeting?")) return;
    setIsLoading(true);
    try {
      const res = await cancelMeeting(meetingId);
      toast.success(res.message || "🗑️ Meeting deleted successfully!");
      setMeetings((prev) => prev.filter((m) => m.meetingId !== meetingId));
    } catch (error) {
      toast.error("❌ Error deleting meeting!");
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
      status: "",
    });
    setMeetingId(null);
    setRoomId(null);
    setAvailableRooms([]);
    setSelectedPhysicalRoom(null);
    setIsViewMode(false);
    setIsCreateMode(false);
  };

  // 🟢 Fixed: Use moment-timezone to handle Asia/Ho_Chi_Minh (send LocalDateTime format to backend)
  const handleDateTimeChange = (field, momentDate) => {
    if (momentDate && momentDate.isValid()) {
      // Format to 'YYYY-MM-DDTHH:mm:ss' in Asia/Ho_Chi_Minh timezone (no offset, matches backend LocalDateTime)
      const vnTime = momentDate.tz('Asia/Ho_Chi_Minh');
      setForm({ ...form, [field]: vnTime.format('YYYY-MM-DDTHH:mm:ss') });
    } else {
      setForm({ ...form, [field]: "" });
    }
  };

  // 🟢 Fixed: Format for Datetime value - use moment-timezone to display in VN time
  const formatDate = (dateString) => {
    if (dateString) {
      // Parse 'YYYY-MM-DDTHH:mm:ss' string and set Asia/Ho_Chi_Minh timezone
      return moment.tz(dateString, 'YYYY-MM-DDTHH:mm:ss', 'Asia/Ho_Chi_Minh');
    }
    return null;
  };

  const filteredMeetings = meetings.filter((m) =>
    m.title.toLowerCase().includes(search.toLowerCase())
  );

  // Helper function to render status icon
  const renderStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return <FaCheckCircle className="status-icon completed" />;
      case 'upcoming':
        return <FaClock className="status-icon upcoming" />;
      default:
        return <span className="status-text">{status}</span>;
    }
  };

  // 🟢 Render step content for create mode
  const renderCreateSteps = () => (
    <>
      {/* STEP 1 */}
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

      {/* STEP 2 */}
      {step === 2 && (
        <>
          <div className="success-message">
            ✅ Meeting created (ID: {meetingId})
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
          {form.roomType === "PHYSICAL" && (
            <div className="user-form-group">
              <label>Number of participants *</label>
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

  // 🟢 Render full form for view/edit
  const renderEditViewForm = () => (
    <>
      <div className="user-form-group">
        <label>Title {isViewMode ? "" : "*"}</label>
        <input
          type="text"
          name="title"
          value={form.title}
          onChange={handleFormChange}
          placeholder="Enter title"
          disabled={isViewMode}
          readOnly={isViewMode}
        />
      </div>
      <div className="user-form-group">
        <label>Start time {isViewMode ? "" : "*"}</label>
        <div className="datetime-picker-container">
          <Datetime
            value={formatDate(form.startTime)}
            onChange={(date) => handleDateTimeChange("startTime", date)}
            dateFormat="DD/MM/YYYY"
            timeFormat="HH:mm"
            inputProps={{
              placeholder: "Select start time",
              readOnly: true,
              disabled: isViewMode,
            }}
            closeOnSelect
            disabled={isViewMode}
          />
          <FaCalendarAlt className="input-icon" />
        </div>
      </div>
      <div className="user-form-group">
        <label>End time {isViewMode ? "" : "*"}</label>
        <div className="datetime-picker-container">
          <Datetime
            value={formatDate(form.endTime)}
            onChange={(date) => handleDateTimeChange("endTime", date)}
            dateFormat="DD/MM/YYYY"
            timeFormat="HH:mm"
            inputProps={{
              placeholder: "Select end time",
              readOnly: true,
              disabled: isViewMode,
            }}
            closeOnSelect
            disabled={isViewMode}
          />
          <FaCalendarAlt className="input-icon" />
        </div>
      </div>
      <div className="user-form-group">
        <label>Room type {isViewMode ? "" : "*"}</label>
        <select
          name="roomType"
          value={form.roomType}
          onChange={handleFormChange}
          disabled={isViewMode}
        >
          <option value="PHYSICAL">Physical room</option>
          <option value="ONLINE">Online room</option>
        </select>
      </div>
      <div className="user-form-group">
        <label>Room name {isViewMode ? "" : "*"}</label>
        <input
          type="text"
          name="roomName"
          value={form.roomName}
          onChange={handleFormChange}
          placeholder="Enter room name"
          disabled={isViewMode}
        />
      </div>
      {form.roomType === "PHYSICAL" && (
        <>
          <div className="user-form-group">
            <label>Number of participants {isViewMode ? "" : "*"}</label>
            <input
              type="number"
              name="participants"
              value={form.participants}
              onChange={handleFormChange}
              min={1}
              disabled={isViewMode}
            />
          </div>
          <div className="user-form-group">
            <label>Selected physical room</label>
            {isViewMode ? (
              <p className="info-label">{selectedPhysicalRoom ? `Room ${selectedPhysicalRoom}` : "Not assigned"}</p>
            ) : (
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
            )}
          </div>
        </>
      )}
  
    </>
  );

  // 🟢 Check validation for create steps
  const isStepValid = () => {
    if (step === 1) return form.title && form.startTime && form.endTime;
    if (step === 2) return form.roomType && form.roomName.trim() !== "";
    if (step === 3) return form.roomType === "ONLINE" || selectedPhysicalRoom;
    return false;
  };

  return (
    <div className="my-meeting-container">
      <ToastContainer position="top-right" autoClose={2500} hideProgressBar />
      <div className="user-header">
        <div className="header-title">
          <h2>My Meetings</h2>
          <p>List of meetings you have created</p>
        </div>
        <button className="btn-add" onClick={() => handleOpenModal(null)}>
          <FaPlus /> Create Meeting
        </button>
      </div>

      <div className="search-bar">
        <FaSearch className="search-icon" />
        <input
          type="text"
          placeholder="Search meetings..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* 🟢 Meeting list - Card Layout */}
      <div className="meetings-cards-container">
        {filteredMeetings.length === 0 ? (
          <div className="empty-state">
            <FaCalendarAlt style={{ fontSize: '48px', color: '#9ca3af', marginBottom: '16px' }} />
            <h3>No meetings yet</h3>
            <p>Create your first meeting now!</p>
            <button className="btn-add-empty" onClick={() => handleOpenModal(null)}>
              <FaPlus /> Create Meeting Now
            </button>
          </div>
        ) : (
          <div className="meetings-grid">
            {filteredMeetings.map((meeting) => (
              <div key={meeting.meetingId} className="meeting-card">
                <div className="card-header">
                  <h4 className="meeting-title">{meeting.title}</h4>
                  {renderStatusIcon(meeting.status)}
                </div>
                <div className="card-body">
                  {/* 🟢 Fixed: Display in Asia/Ho_Chi_Minh timezone */}
                  <p><strong>Start:</strong> {moment.tz(meeting.startTime, 'Asia/Ho_Chi_Minh').format('DD/MM/YYYY HH:mm:ss')}</p>
                  <p><strong>End:</strong> {moment.tz(meeting.endTime, 'Asia/Ho_Chi_Minh').format('DD/MM/YYYY HH:mm:ss')}</p>
                  <p><strong>Room:</strong> {meeting.roomName}</p>
                </div>
                <div className="card-footer">
                  <button
                    className="btn-view"
                    onClick={() => handleOpenModal(meeting, true)} // View mode
                  >
                    <FaEye /> View
                  </button>
                  <button
                    className="btn-edit"
                    onClick={() => handleOpenModal(meeting, false)} // Edit mode
                  >
                    <FaEdit /> Edit
                  </button>
                  <button
                    className="btn-delete"
                    onClick={() => handleDeleteMeeting(meeting.meetingId)}
                    disabled={isLoading}
                  >
                    <FaTrash /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 🟢 Modal: Conditional based on mode */}
      {showModal && (
        <div className="modal-overlay" onClick={resetModal}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                {isCreateMode
                  ? `Step ${step}: ${step === 1 ? "Create Meeting" : step === 2 ? "Create Meeting Room" : "Assign Physical Room"}`
                  : isViewMode
                  ? "View Meeting Details"
                  : "Edit Meeting"
                }
              </h3>
              <button className="close-btn" onClick={resetModal}>
                ×
              </button>
            </div>

            <div className="modal-body">
              {/* 🟢 Step progress only for create */}
              {isCreateMode && (
                <div className="step-progress">
                  <div className={`step-item ${step >= 1 ? "active" : ""}`}>1</div>
                  <div className={`step-item ${step >= 2 ? "active" : ""}`}>2</div>
                  <div className={`step-item ${step >= 3 ? "active" : ""}`}>3</div>
                </div>
              )}

              {/* 🟢 Content based on mode */}
              {isCreateMode ? renderCreateSteps() : renderEditViewForm()}
            </div>

            <div className="modal-footer">
              <button className="btn-cancel" onClick={resetModal}>
                {isViewMode ? "Close" : "Cancel"}
              </button>

              {/* 🟢 Buttons for create mode (3 steps) */}
              {isCreateMode && step === 1 && (
                <button
                  className="btn-save"
                  disabled={!isStepValid() || isLoading}
                  onClick={handleInitMeeting}
                >
                  {isLoading ? "Processing..." : "Continue"}
                </button>
              )}

              {isCreateMode && step === 2 && (
                <button
                  className="btn-save"
                  disabled={!isStepValid() || isLoading}
                  onClick={handleCreateRoom}
                >
                  {isLoading ? "Processing..." : "Create Room"}
                </button>
              )}

              {isCreateMode && step === 3 && (
                <button
                  className="btn-save"
                  disabled={!isStepValid() || isLoading}
                  onClick={handleAssignRoom}
                >
                  {isLoading ? "Processing..." : "Finish"}
                </button>
              )}

              {/* 🟢 Buttons for edit/view */}
              {!isCreateMode && !isViewMode && (
                <button
                  className="btn-save"
                  disabled={isLoading || !form.title || !form.startTime || !form.endTime}
                  onClick={handleUpdateMeeting}
                >
                  {isLoading ? "Saving..." : "Save Changes"}
                </button>
              )}

              {isViewMode && (
                <button className="btn-save" onClick={() => setIsViewMode(false)}>
                  Switch to edit
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