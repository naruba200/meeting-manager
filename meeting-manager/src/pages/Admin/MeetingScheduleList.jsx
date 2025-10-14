import React, { useState, useEffect } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { enUS } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "../../assets/styles/MeetingScheduleList.css";
import { getAllMeetings } from "../../services/meetingService";
import { 
  FiCalendar, 
  FiMapPin, 
  FiClock, 
  FiUser, 
  FiTag
} from "react-icons/fi";

// 🔹 Modal with close button
const Modal = ({ meeting, onClose }) => {
  if (!meeting) return null;

  const getStatusColor = (status) => {
    switch (status) {
      case "CANCELLED": return "#ef4444";
      case "SCHEDULED": return "#10b981";
      case "ONGOING": return "#f59e0b";
      case "COMPLETED": return "#6b7280";
      default: return "#3b82f6";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "CANCELLED": return "Cancelled";
      case "SCHEDULED": return "Scheduled";
      case "ONGOING": return "Ongoing";
      case "COMPLETED": return "Completed";
      default: return status;
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="header-left">
            <FiCalendar className="modal-icon" />
            <h2>Meeting Details</h2>
          </div>
          <button className="close-x-btn" onClick={onClose}>
            <span className="close-x-icon">×</span>
          </button>
        </div>

        <div className="meeting-info-grid">
          {/* ID and Status */}
          <div className="info-card">
            <FiTag className="info-icon" />
            <div className="info-content">
              <span className="info-label">Meeting ID</span>
              <span className="info-value">#{meeting.meetingId}</span>
            </div>
          </div>

          <div className="info-card">
            <div className="info-content">
              <span className="info-label">Status</span>
              <span 
                className="status-badge"
                style={{ backgroundColor: getStatusColor(meeting.status) }}
              >
                {getStatusText(meeting.status)}
              </span>
            </div>
          </div>

          {/* Title */}
          <div className="info-card full-width">
            <div className="info-content">
              <span className="info-label">Title</span>
              <span className="info-value title">{meeting.title}</span>
              {meeting.description && (
                <p className="description">{meeting.description}</p>
              )}
            </div>
          </div>

          {/* Meeting Room */}
          <div className="info-card">
            <FiMapPin className="info-icon" />
            <div className="info-content">
              <span className="info-label">Meeting Room</span>
              <span className="info-value">{meeting.roomName}</span>
            </div>
          </div>

          {/* Organizer */}
          <div className="info-card">
            <FiUser className="info-icon" />
            <div className="info-content">
              <span className="info-label">Organizer</span>
              <span className="info-value">{meeting.organizerName}</span>
            </div>
          </div>

          {/* Time */}
          <div className="info-card full-width">
            <FiClock className="info-icon" />
            <div className="info-content">
              <span className="info-label">Time</span>
              <div className="time-info">
                <span className="date">
                  {new Date(meeting.startTime).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
                <span className="time-range">
                  {new Date(meeting.startTime).toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })} - {new Date(meeting.endTime).toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const locales = { 'en-US': enUS };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

const MeetingCalendar = () => {
  const [events, setEvents] = useState([]);
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMeetings();
  }, []);

  const fetchMeetings = async () => {
    try {
      setLoading(true);
      const data = await getAllMeetings();
      const list = Array.isArray(data.content) ? data.content : [];
      const mappedEvents = list.map((m) => ({
        id: m.meetingId,
        title: m.title,
        start: new Date(m.startTime),
        end: new Date(m.endTime),
        resource: m,
      }));
      setEvents(mappedEvents);
    } catch (err) {
      console.error("Error loading meetings:", err);
    } finally {
      setLoading(false);
    }
  };

  const eventStyleGetter = (event) => {
    const statusColors = {
      CANCELLED: "#ef4444",
      SCHEDULED: "#10b981",
      ONGOING: "#f59e0b",
      COMPLETED: "#6b7280",
      default: "#3b82f6",
    };

    const backgroundColor = statusColors[event.resource.status] || statusColors.default;

    return {
      style: {
        backgroundColor,
        borderRadius: "4px",
        color: "white",
        border: "none",
        padding: "1px 4px",
        fontSize: "11px",
        fontWeight: "500",
        cursor: "pointer",
      },
    };
  };

  const handleEventSelect = (event) => {
    setSelectedMeeting(event.resource);
  };

  if (loading) {
    return (
      <div className="calendar-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          Loading meeting calendar...
        </div>
      </div>
    );
  }

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <h1 className="calendar-title">
          <FiCalendar className="title-icon" />
          Meeting Schedule
        </h1>
        <div className="calendar-stats">
          <span className="stat-item">
            Total: <strong>{events.length}</strong> meetings
          </span>
        </div>
      </div>
      
      <div className="calendar-wrapper">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 600 }}
          eventPropGetter={eventStyleGetter}
          defaultView="week"
          views={["day", "week", "month"]}
          messages={{
            next: "Next",
            previous: "Previous",
            today: "Today",
            month: "Month",
            week: "Week",
            day: "Day",
          }}
          onSelectEvent={handleEventSelect}
          popup
        />
      </div>

      {selectedMeeting && (
        <Modal
          meeting={selectedMeeting}
          onClose={() => setSelectedMeeting(null)}
        />
      )}
    </div>
  );
};

export default MeetingCalendar;
