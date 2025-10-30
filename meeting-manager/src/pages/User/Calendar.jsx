import React, { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { getCurrentUser, logout } from "../../services/authService";
import { getMeetingsByOrganizer } from "../../services/Lichapi";
import "../../assets/styles/UserCSS/Calendar.css";

const CalendarPage = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    loadMeetings();
  }, []);

  const loadMeetings = async () => {
    const user = getCurrentUser();

    if (!user || !user.userId || user.userId === "null" || user.userId === null) {
      alert("Không tìm thấy người dùng. Vui lòng đăng nhập lại!");
      logout();
      window.location.href = "/login";
      return;
    }

    // Ensure userId is a number; handle if it's a string
    const organizerId = parseInt(user.userId, 10);
    if (isNaN(organizerId) || organizerId <= 0) {
      alert("ID người dùng không hợp lệ. Vui lòng đăng nhập lại!");
      logout();
      window.location.href = "/login";
      return;
    }

    try {
      const result = await getMeetingsByOrganizer(organizerId);

      const mappedEvents = result.map(m => ({
        id: m.meetingId,
        title: m.title,
        start: m.startTime,
        end: m.endTime,
        backgroundColor: getEventColor(m.status),
        borderColor: getEventColor(m.status),
        className: `status-${m.status.toLowerCase().replace(/[^a-z0-9]/g, '-')}`, // For CSS targeting
        extendedProps: {
          status: m.status,
          room: m.roomName,
          location: m.location
        }
      }));

      setEvents(mappedEvents);
    } catch (error) {
      console.error("Error loading meetings:", error);
      // Optionally show user-friendly error
      alert("Lỗi khi tải lịch họp. Vui lòng thử lại sau!");
    }
  };

  const getEventColor = (status) => {
    switch (status) {
      case "SCHEDULED":
        return "#1e3a8a"; // Deep navy to match theme
      case "ONGOING":
        return "#3b82f6"; // Smoky blue
      case "COMPLETED":
        return "#a78bfa"; // Light purple
      case "CANCELLED":
        return "#ef4444"; // Red
      default:
        return "#64748b"; // Cool gray
    }
  };

  const handleEventClick = (info) => {
    setSelectedEvent(info.event);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "SCHEDULED":
        return "badge-scheduled";
      case "ONGOING":
        return "badge-ongoing";
      case "COMPLETED":
        return "badge-completed";
      case "CANCELLED":
        return "badge-cancelled";
      default:
        return "badge-default";
    }
  };

  // Helper to format date safely
  const formatDateRange = (start, end) => {
    if (!start || !end) return "Thời gian không xác định";
    return `${start.toLocaleString('vi-VN', { 
      weekday: 'short', 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    })} - ${end.toLocaleString('vi-VN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })}`;
  };

  return (
    <div className="calendar-container">
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        events={events}
        eventClick={handleEventClick}
        height="80vh"
        eventDisplay="block"
        eventTextColor="#ffffff"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,dayGridWeek'
        }}
        locale="vi"
      />

      {/* Modal hiển thị thông tin cuộc họp */}
      {isModalOpen && selectedEvent && (() => {
        const { title, extendedProps } = selectedEvent;
        const dateRange = formatDateRange(selectedEvent.start, selectedEvent.end);
        return (
          <div className="modal-overlay" onClick={closeModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="calendar-modal-header">
                <h2 className="modal-title">{title}</h2>
                <span className="modal-close" onClick={closeModal}>&times;</span>
              </div>
              <div className="modal-body">
                <div className="event-info">
                  <div className="info-item">
                    <strong>Thời gian:</strong>
                    <span>{dateRange}</span>
                  </div>
                  <div className="info-item">
                    <strong>Trạng thái:</strong>
                    <span className={`status-badge ${getStatusBadgeClass(extendedProps?.status || 'DEFAULT')}`}>
                      {extendedProps?.status || 'UNKNOWN'}
                    </span>
                  </div>
                  <div className="info-item">
                    <strong>Phòng họp:</strong>
                    <span>{extendedProps?.room || 'Chưa chỉ định'}</span>
                  </div>
                  <div className="info-item">
                    <strong>Vị trí:</strong>
                    <span>{extendedProps?.location || 'Chưa chỉ định'}</span>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn-close" onClick={closeModal}>Đóng</button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default CalendarPage;