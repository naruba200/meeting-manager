import React, { useEffect, useState, useRef, useContext } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { getCurrentUser, logout } from "../../services/authService";
import { getMeetingsByOrganizer } from "../../services/Lichapi";
import "../../assets/styles/UserCSS/Calendar.css";
import { ThemeContext } from "../../context/ThemeContext";

const CalendarPage = () => {
  // const { theme } = useContext(ThemeContext);
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const calendarRef = useRef(null);

  useEffect(() => {
    loadMeetings();
  }, []);

  const loadMeetings = async () => {
    const user = getCurrentUser();

    if (!user || !user.userId || user.userId === "null" || user.userId === null) {
      alert("Cant find the player, please login again!");
      logout();
      window.location.href = "/login";
      return;
    }

    const organizerId = parseInt(user.userId, 10);
    if (isNaN(organizerId) || organizerId <= 0) {
      alert("User is invalid, please login again!");
      logout();
      window.location.href = "/login";
      return;
    }

    try {
      const result = await getMeetingsByOrganizer(organizerId);

      const mappedEvents = result.map((m) => ({
        id: m.meetingId,
        title: m.title,
        start: m.startTime,
        end: m.endTime,
        backgroundColor: getEventColor(m.status),
        borderColor: getEventColor(m.status),
        className: `status-${m.status.toLowerCase().replace(/[^a-z0-9]/g, "-")}`,
        extendedProps: {
          status: m.status,
          room: m.roomName,
          location: m.location,
        },
      }));

      setEvents(mappedEvents);
    } catch (error) {
      console.error("Error loading meetings:", error);
      alert("There is a problem when loading plaese try again latter!");
    }
  };

  const getEventColor = (status) => {
    switch (status) {
      case "SCHEDULED":
        return "#1e3a8a";
      case "ONGOING":
        return "#3b82f6";
      case "COMPLETED":
        return "#a78bfa";
      case "CANCELLED":
        return "#ef4444";
      default:
        return "#64748b";
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

  const formatDateRange = (start, end) => {
    if (!start || !end) return "Time cant be determine please try again";
    return `${start.toLocaleString("vi-VN", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })} - ${end.toLocaleString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  };

  // 🟢 Khi người dùng chọn ngày trong input
  const handleDateChange = (e) => {
    const dateStr = e.target.value;
    setSelectedDate(dateStr);
    if (calendarRef.current && dateStr) {
      const calendarApi = calendarRef.current.getApi();
      calendarApi.gotoDate(dateStr); // Di chuyển lịch đến ngày được chọn
    }
  };

  // 🟢 Hàm mở date picker khi click button
  const openDatePicker = () => {
    const dateInput = document.getElementById("datePicker");
    if (dateInput) {
      dateInput.showPicker(); // Sử dụng native showPicker() để mở date picker (hỗ trợ trên Chrome/Edge hiện đại)
    }
  };

  return (
    <div className="calendar-page-wrapper">
      {/* ===== Sidebar điều khiển (giữ lại nhưng trống, có thể xóa sau) ===== */}
      <div className="calendar-sidebar">
        {/* Nội dung sidebar đã di chuyển vào toolbar */}
      </div>

      {/* ===== Lịch chính ===== */}
      <div className="calendar-main">
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          events={events}
          eventClick={handleEventClick}
          height="90vh"
          eventDisplay="block"
          eventTextColor="#ffffff"
          headerToolbar={{
            left: "prev,next today datePicker",
            center: "title",
            right: "dayGridMonth,dayGridWeek",
          }}
          customButtons={{
            datePicker: {
              html: `
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect width="16" height="16" x="4" y="4" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
              `,
              click: openDatePicker,
            },
          }}
          locale="vi"
        />

        {/* ===== Input date ẩn để xử lý logic và showPicker ===== */}
        <input
          id="datePicker"
          type="date"
          value={selectedDate}
          onChange={handleDateChange}
          style={{ display: "none" }}
        />

        {/* ===== Modal thông tin ===== */}
        {isModalOpen && selectedEvent && (() => {
          const { title, extendedProps } = selectedEvent;
          const dateRange = formatDateRange(selectedEvent.start, selectedEvent.end);
          return (
            <div className="modal-overlay" onClick={closeModal}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="calendar-modal-header">
                  <h2 className="modal-title">{title}</h2>
                  <span className="modal-close" onClick={closeModal}>
                    &times;
                  </span>
                </div>
                <div className="modal-body">
                  <div className="event-info">
                    <div className="info-item">
                      <strong>Time:</strong>
                      <span>{dateRange}</span>
                    </div>
                    <div className="info-item">
                      <strong>Trạng thái:</strong>
                      <span
                        className={`status-badge ${getStatusBadgeClass(
                          extendedProps?.status || "DEFAULT"
                        )}`}
                      >
                        {extendedProps?.status || "UNKNOWN"}
                      </span>
                    </div>
                    <div className="info-item">
                      <strong>Room:</strong>
                      <span>{extendedProps?.room || "Chưa chỉ định"}</span>
                    </div>
                    <div className="info-item">
                      <strong>Location:</strong>
                      <span>{extendedProps?.location || "Chưa chỉ định"}</span>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button className="btn-close" onClick={closeModal}>
                    Close
                  </button>
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
};

export default CalendarPage;