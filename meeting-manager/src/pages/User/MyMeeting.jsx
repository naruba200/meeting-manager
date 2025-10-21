import React, { useState, useEffect } from "react";
import { FaSearch, FaCalendarAlt, FaCheckCircle, FaClock, FaEye, FaEdit, FaTrash, FaPlus } from "react-icons/fa"; // Added FaPlus to imports
import moment from "moment-timezone";
import "../../assets/styles/UserCSS/MyMeeting.css";
import {
  getMeetingsByOrganizer,
  updateMeeting,
  cancelMeeting,
  getPhysicalRoomById,
} from "../../services/meetingServiceUser.js";
import Datetime from "react-datetime";
import "react-datetime/css/react-datetime.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import CreateMeeting from "./CreateMeetingModal.jsx";

const MyMeeting = () => {
  const [search, setSearch] = useState("");
  const [meetings, setMeetings] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [meetingId, setMeetingId] = useState(null);
  const [roomId, setRoomId] = useState(null);
  const [selectedPhysicalRoom, setSelectedPhysicalRoom] = useState(null);
  const [originalPhysicalRoom, setOriginalPhysicalRoom] = useState(null);
  const [assignedRoom, setAssignedRoom] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isViewMode, setIsViewMode] = useState(false);
  const [form, setForm] = useState({
    title: "",
    startTime: "",
    endTime: "",
    roomType: "PHYSICAL",
    roomName: "",
    status: "",
    participants: 1,
  });

  const user = JSON.parse(localStorage.getItem("user"));
  const organizerId = user?.userId;

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

  const handleOpenModal = (meeting = null, viewMode = false) => {
    if (meeting) {
      setIsViewMode(viewMode);
      setForm({
        title: meeting.title,
        startTime: meeting.startTime,
        endTime: meeting.endTime,
        roomType: meeting.roomType || "PHYSICAL",
        roomName: meeting.roomName || "",
        status: meeting.status || "",
        participants: 1,
      });
      setMeetingId(meeting.meetingId);
      setRoomId(meeting.roomId);
      setSelectedPhysicalRoom(meeting.physicalId || null);
      setOriginalPhysicalRoom(meeting.physicalId || null);
      setAssignedRoom(meeting.location ? { location: meeting.location } : null);
      if (meeting.roomType === "PHYSICAL" && meeting.physicalId) {
        getPhysicalRoomById(meeting.physicalId)
          .then((room) => {
            setAssignedRoom(room);
          })
          .catch((error) => {
            toast.error("❌ Error loading room information!");
            console.error("Error fetching room:", error);
          });
      }
    } else {
      setForm({
        title: "",
        startTime: "",
        endTime: "",
        roomType: "PHYSICAL",
        roomName: "",
        status: "",
        participants: 1,
      });
      setMeetingId(null);
      setRoomId(null);
      setSelectedPhysicalRoom(null);
      setOriginalPhysicalRoom(null);
      setAssignedRoom(null);
    }
    setIsLoading(false);
    setShowModal(true);
  };

  const handleUpdateMeeting = async () => {
    setIsLoading(true);
    try {
      const meetingPayload = {
        title: form.title,
        startTime: form.startTime,
        endTime: form.endTime,
      };
      await updateMeeting(meetingId, meetingPayload);
      toast.success("✅ Meeting updated successfully!");
      const updatedMeetings = await getMeetingsByOrganizer(organizerId);
      setMeetings(updatedMeetings);
      resetModal();
    } catch (error) {
      toast.error("❌ Error updating meeting!");
      console.error("Error updating meeting:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteMeeting = async (meetingId) => {
    if (!window.confirm("Are you sure you want to cancel this meeting?")) return;
    setIsLoading(true);
    try {
      const res = await cancelMeeting(meetingId);
      toast.success(res.message || "🗑️ Meeting canceled successfully!");
      setMeetings((prev) => prev.filter((m) => m.meetingId !== meetingId));
    } catch (error) {
      toast.error("❌ Error canceling meeting!");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetModal = () => {
    setShowModal(false);
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
    setOriginalPhysicalRoom(null);
    setAssignedRoom(null);
    setIsViewMode(false);
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

  const filteredMeetings = meetings.filter((m) =>
    m.title.toLowerCase().includes(search.toLowerCase())
  );

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

  const renderViewForm = () => (
    <>
      <div className="user-form-group">
        <label>Title</label>
        <input
          type="text"
          name="title"
          value={form.title}
          onChange={handleFormChange}
          placeholder="Enter title"
          disabled={true}
          readOnly={true}
        />
      </div>
      <div className="user-form-group">
        <label>Start time</label>
        <div className="datetime-picker-container">
          <Datetime
            value={formatDate(form.startTime)}
            onChange={(date) => handleDateTimeChange("startTime", date)}
            dateFormat="DD/MM/YYYY"
            timeFormat="HH:mm"
            inputProps={{
              placeholder: "Select start time",
              readOnly: true,
              disabled: true,
            }}
            closeOnSelect
            disabled={true}
          />
          <FaCalendarAlt className="input-icon" />
        </div>
      </div>
      <div className="user-form-group">
        <label>End time</label>
        <div className="datetime-picker-container">
          <Datetime
            value={formatDate(form.endTime)}
            onChange={(date) => handleDateTimeChange("endTime", date)}
            dateFormat="DD/MM/YYYY"
            timeFormat="HH:mm"
            inputProps={{
              placeholder: "Select end time",
              readOnly: true,
              disabled: true,
            }}
            closeOnSelect
            disabled={true}
          />
          <FaCalendarAlt className="input-icon" />
        </div>
      </div>
      <div className="user-form-group">
        <label>Room type</label>
        <select
          name="roomType"
          value={form.roomType}
          onChange={handleFormChange}
          disabled={true}
        >
          <option value="PHYSICAL">Physical room</option>
          <option value="ONLINE">Online room</option>
        </select>
      </div>
      <div className="user-form-group">
        <label>Room name</label>
        <input
          type="text"
          name="roomName"
          value={form.roomName}
          onChange={handleFormChange}
          placeholder="Enter room name"
          disabled={true}
        />
      </div>
      {form.roomType === "PHYSICAL" && (
        <div className="user-form-group">
          <label>Selected physical room</label>
          <p className="info-label">
            {selectedPhysicalRoom ? (
              <>
                Room: {selectedPhysicalRoom}
                {assignedRoom && assignedRoom.location
                  ? ` (Location: ${assignedRoom.location})`
                  : " (No location available)"}
              </>
            ) : (
              "Not assigned"
            )}
          </p>
        </div>
      )}
    </>
  );

  const renderEditForm = () => (
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
  );

  return (
    <div className="my-meeting-container">
      <ToastContainer position="top-right" autoClose={2500} hideProgressBar />
      <div className="user-header">
        <div className="header-title">
          <h2>My Meetings</h2>
          <p>List of meetings you have created</p>
        </div>
        <button className="btn-add-meeting" onClick={() => handleOpenModal(null)}>
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
                  <p><strong>Start:</strong> {moment.tz(meeting.startTime, 'Asia/Ho_Chi_Minh').format('DD/MM/YYYY HH:mm:ss')}</p>
                  <p><strong>End:</strong> {moment.tz(meeting.endTime, 'Asia/Ho_Chi_Minh').format('DD/MM/YYYY HH:mm:ss')}</p>
                  <p><strong>Room:</strong> {meeting.roomName}</p>
                </div>
                <div className="card-footer">
                  <button
                    className="btn-view"
                    onClick={() => handleOpenModal(meeting, true)}
                  >
                    <FaEye /> View
                  </button>
                  <button
                    className="btn-edit-meeting"
                    onClick={() => handleOpenModal(meeting, false)}
                  >
                    <FaEdit /> Edit
                  </button>
                  <button
                    className="btn-delete"
                    onClick={() => handleDeleteMeeting(meeting.meetingId)}
                    disabled={isLoading}
                  >
                    <FaTrash /> Cancel
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={resetModal}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                {isViewMode ? "View Meeting Details" : "Edit Meeting"}
              </h3>
              <button className="close-btn" onClick={resetModal}>
                ×
              </button>
            </div>

            <div className="modal-body">
              {isViewMode ? renderViewForm() : renderEditForm()}
            </div>

            <div className="modal-footer">
              <button className="btn-cancel" onClick={resetModal}>
                {isViewMode ? "Close" : "Cancel"}
              </button>

              {!isViewMode && (
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

      <CreateMeeting
        showModal={showModal && !isViewMode && !meetingId}
        setShowModal={setShowModal}
        organizerId={organizerId}
        setMeetings={setMeetings}
      />
    </div>
  );
};

export default MyMeeting;