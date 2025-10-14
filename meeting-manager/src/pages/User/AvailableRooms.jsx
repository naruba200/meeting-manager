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

  // --- Meeting Room Dialog ---
  const [showDialog, setShowDialog] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [meetingRoomName, setMeetingRoomName] = useState("");
  const [creatingRoom, setCreatingRoom] = useState(false);
  const [createMessage, setCreateMessage] = useState("");

  // --- Meeting Dialog ---
  const [showMeetingDialog, setShowMeetingDialog] = useState(false);
  const [meetingData, setMeetingData] = useState({ title: "", description: "" });
  const [creatingMeeting, setCreatingMeeting] = useState(false);
  const [meetingMessage, setMeetingMessage] = useState("");
  const [createdRoomId, setCreatedRoomId] = useState(null);

  // Handle form input changes
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

  // Call API to get list of available rooms
  const fetchAvailableRooms = async () => {
    if (!form.startTime || !form.endTime) {
      setError("Please select a start and end time!");
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
      console.error("❌ Error loading room list:", err);
      setError("Could not load the list of available rooms.");
    } finally {
      setLoading(false);
    }
  };

  // When a room is selected
  const handleSelectRoom = (room) => {
    setSelectedRoom(room);
    setMeetingRoomName("");
    setCreateMessage("");
    setShowDialog(true);
  };

  // Call API to create a Meeting Room
  const handleCreateMeetingRoom = async () => {
    if (!meetingRoomName.trim()) {
      setCreateMessage("Please enter a name for the meeting room.");
      return;
    }

    setCreatingRoom(true);
    setCreateMessage("");

    try {
      const data = await createMeetingRoomFromPhysical(meetingRoomName, selectedRoom.physicalId);
      setCreateMessage(`✅ Successfully created: ${data.roomName}`);
      setCreatedRoomId(data.roomId);
      setShowMeetingDialog(true); // Open the create meeting dialog
    } catch (err) {
      console.error("❌ Error creating meeting room:", err);
      setCreateMessage("❌ Could not create meeting room.");
    } finally {
      setCreatingRoom(false);
    }
  };

  // Call API to create a Meeting
  const handleCreateMeeting = async () => {
    if (!meetingData.title.trim()) {
      setMeetingMessage("Please enter a title for the meeting.");
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

      // Show success message
      setMeetingMessage(`✅ Meeting created successfully: ${data.title}`);

      // Close dialog after 1.2 seconds
      setTimeout(() => {
        setShowMeetingDialog(false);
        setShowDialog(false);
        setMeetingData({ title: "", description: "" });
        setMeetingMessage("");
        alert("Meeting created successfully!");
      }, 1200);
    } catch (err) {
      console.error("❌ Error creating meeting:", err);
      setMeetingMessage("❌ Could not create meeting.");
    } finally {
      setCreatingMeeting(false);
    }
  };

  return (
    <div className="available-rooms-container">
      <h2>List of available rooms</h2>
      <p>Select a time and criteria to find a suitable room</p>

      {/* Filters */}
      <div className="filter-form">
        <div className="form-row">
          <div className="user-form-group">
            <label>Start time *</label>
            <div className="datetime-picker-container">
              <Datetime
                value={formatDate(form.startTime)}
                onChange={(date) => handleDateTimeChange("startTime", date)}
                dateFormat="DD/MM/YYYY"
                timeFormat="HH:mm"
                inputProps={{ placeholder: "Select start time", readOnly: true }}
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
                inputProps={{ placeholder: "Select end time", readOnly: true }}
                closeOnSelect
              />
              <FaCalendarAlt className="input-icon" />
            </div>
          </div>
        </div>

        <div className="form-row">
          <div className="user-form-group">
            <label>Room type</label>
            <div className="room-type-selector">
              <button
                type="button"
                className={`room-type-btn ${form.roomType === "PHYSICAL" ? "active" : ""}`}
                onClick={() => setForm({ ...form, roomType: "PHYSICAL" })}
              >
                <FaBuilding /> Physical room
              </button>
              <button
                type="button"
                className={`room-type-btn ${form.roomType === "ONLINE" ? "active" : ""}`}
                onClick={() => setForm({ ...form, roomType: "ONLINE" })}
              >
                <FaVideo /> Online room
              </button>
            </div>
          </div>

          {form.roomType === "PHYSICAL" && (
            <div className="user-form-group">
              <label>Number of participants</label>
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
          {loading ? "Searching..." : "Find available rooms"}
        </button>

        {error && <p className="error-message">{error}</p>}
      </div>

      {/* Room list */}
      <div className="rooms-list">
        {rooms.length > 0 ? (
          rooms.map((room) => (
            <div key={room.physicalId} className="room-card">
              <h3>{room.location}</h3>
              <p>
                Capacity: {room.capacity} people <br />
                Equipment: {room.equipment}
              </p>
              <small>
                {moment(room.filteredStartTime).format("DD/MM/YYYY HH:mm")} -{" "}
                {moment(room.filteredEndTime).format("DD/MM/YYYY HH:mm")}
              </small>
              <button className="btn-select" onClick={() => handleSelectRoom(room)}>
                Select room
              </button>
            </div>
          ))
        ) : (
          !loading && <p className="empty-state">No suitable rooms available.</p>
        )}
      </div>

      {/* Dialog 1: Book a meeting room */}
      {showDialog && (
        <div className="dialog-overlay">
          <div className="dialog-box">
            <h3>Book a meeting room</h3>
            <p>Room: <strong>{selectedRoom?.location}</strong></p>
            <div className="user-form-group">
              <label>Meeting room name</label>
              <input
                type="text"
                value={meetingRoomName}
                onChange={(e) => setMeetingRoomName(e.target.value)}
                placeholder="Enter meeting room name..."
              />
            </div>

            {createMessage && <p className="status-message">{createMessage}</p>}

            <div className="dialog-actions">
              <button onClick={() => setShowDialog(false)}>Close</button>
              <button onClick={handleCreateMeetingRoom} disabled={creatingRoom}>
                {creatingRoom ? "Creating..." : "Create meeting room"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dialog 2: Create meeting */}
      {showMeetingDialog && (
        <div className="dialog-overlay">
          <div className="dialog-box">
            <h3>Create meeting</h3>
            <div className="user-form-group">
              <label>Meeting title *</label>
              <input
                type="text"
                value={meetingData.title}
                onChange={(e) => setMeetingData({ ...meetingData, title: e.target.value })}
                placeholder="Enter title..."
              />
            </div>
            <div className="user-form-group">
              <label>Description</label>
              <textarea
                value={meetingData.description}
                onChange={(e) => setMeetingData({ ...meetingData, description: e.target.value })}
                placeholder="Enter description..."
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
                Close
              </button>
              <button onClick={handleCreateMeeting} disabled={creatingMeeting}>
                {creatingMeeting ? "Creating..." : "Create meeting"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AvailableRooms;