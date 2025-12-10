import React, { useState, useEffect } from "react";
import { FaSearch, FaCalendarAlt, FaHistory, FaClock, FaMapMarkerAlt, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import moment from "moment-timezone";
import "../../assets/styles/UserCSS/History.css";
import { getMeetingsByOrganizer } from "../../services/meetingServiceUser.js";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const History = () => {
  const [search, setSearch] = useState("");
  const [meetings, setMeetings] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [sortBy, setSortBy] = useState("recent");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const user = JSON.parse(localStorage.getItem("user"));
  const organizerId = user?.userId;

  // Lắng nghe dark mode
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      setIsDarkMode(true);
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }

    const handleMessage = (event) => {
      if (event.data.type === "darkModeChanged") {
        setIsDarkMode(event.data.isDarkMode);
        if (event.data.isDarkMode) {
          document.body.classList.add("dark-mode");
        } else {
          document.body.classList.remove("dark-mode");
        }
      }
    };

    window.addEventListener("message", handleMessage);
    window.parent.postMessage({ type: "requestDarkMode" }, "*");

    return () => window.removeEventListener("message", handleMessage);
  }, []);

  // Fetch all meetings
  useEffect(() => {
    const fetchMeetings = async () => {
      if (!organizerId) return;
      setIsLoading(true);
      try {
        const data = await getMeetingsByOrganizer(organizerId);
        setMeetings(data || []);
      } catch (error) {
        toast.error("Failed to load meetings");
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMeetings();
  }, [organizerId]);

  // Filter past meetings
  const pastMeetings = meetings.filter((meeting) => {
    const endTime = moment.tz(meeting.endTime, "Asia/Ho_Chi_Minh");
    return endTime.isBefore(moment());
  });

  // Filter by search
  const filteredMeetings = pastMeetings.filter((m) =>
    m.title.toLowerCase().includes(search.toLowerCase())
  );

  // Sort meetings
  const sortedMeetings = [...filteredMeetings].sort((a, b) => {
    if (sortBy === "recent") {
      return moment(b.startTime).valueOf() - moment(a.startTime).valueOf();
    } else if (sortBy === "oldest") {
      return moment(a.startTime).valueOf() - moment(b.startTime).valueOf();
    }
    return 0;
  });

  // Pagination
  const totalPages = Math.ceil(sortedMeetings.length / itemsPerPage);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const paginatedMeetings = sortedMeetings.slice(startIdx, startIdx + itemsPerPage);

  // Reset to page 1 when search or sort changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search, sortBy]);

  // Calculate statistics
  const totalMeetings = pastMeetings.length;
  const totalDuration = pastMeetings.reduce((sum, meeting) => {
    const start = moment(meeting.startTime);
    const end = moment(meeting.endTime);
    return sum + end.diff(start, "minutes");
  }, 0);
  const avgDuration = totalMeetings > 0 ? Math.round(totalDuration / totalMeetings) : 0;

  return (
    <div className={`history-container ${isDarkMode ? "dark" : ""}`}>
      <ToastContainer position="top-right" autoClose={2500} hideProgressBar theme={isDarkMode ? "dark" : "light"} />

      {/* Header */}
      <div className="history-header">
        <div className="header-content">
          <div className="header-top">
            <h1><FaHistory /> Meeting History</h1>
            <div className="header-badge">
              {sortedMeetings.length > 0 && (
                <span className="badge-text">{sortedMeetings.length} meetings found</span>
              )}
            </div>
          </div>
          <p>Review all your completed meetings and track your meeting patterns</p>
        </div>
      </div>

      {/* Statistics Cards */}
      {!isLoading && pastMeetings.length > 0 && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon"><FaCalendarAlt /></div>
            <div className="stat-content">
              <span className="stat-value">{totalMeetings}</span>
              <span className="stat-label">Total Meetings</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon"><FaClock /></div>
            <div className="stat-content">
              <span className="stat-value">{Math.floor(totalDuration / 60)}h {totalDuration % 60}m</span>
              <span className="stat-label">Total Duration</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon"><FaClock /></div>
            <div className="stat-content">
              <span className="stat-value">{avgDuration} min</span>
              <span className="stat-label">Average Duration</span>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filter */}
      <div className="history-controls">
        <div className="search-box">
          <FaSearch className="history-search-icon" />
          <input
            type="text"
            placeholder="Search meetings..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select className="sort-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="recent">Most Recent</option>
          <option value="oldest">Oldest First</option>
        </select>
      </div>

      {/* Table View */}
      <div className="history-table-wrapper">
        {isLoading ? (
          <div className="loading">
            <p>Loading your meeting history...</p>
          </div>
        ) : sortedMeetings.length === 0 ? (
          <div className="empty-state">
            <FaCalendarAlt className="empty-icon" />
            <h3>No meeting history</h3>
            <p>{pastMeetings.length === 0 ? "Your completed meetings will appear here" : "No meetings match your search"}</p>
          </div>
        ) : (
          <>
            <div className="history-table">
              <div className="table-header">
                <div className="col-title">Meeting Title</div>
                <div className="col-date">Date</div>
                <div className="col-time">Time</div>
                <div className="col-duration">Duration</div>
                <div className="col-room">Room</div>
              </div>
              {paginatedMeetings.map((meeting) => {
                const start = moment.tz(meeting.startTime, "Asia/Ho_Chi_Minh");
                const end = moment.tz(meeting.endTime, "Asia/Ho_Chi_Minh");
                const duration = end.diff(start, "minutes");

                return (
                  <div key={meeting.meetingId} className="table-row">
                    <div className="col-title">
                      <div className="title-text">{meeting.title}</div>
                      {meeting.description && (
                        <div className="title-desc">{meeting.description}</div>
                      )}
                    </div>
                    <div className="col-date">{start.format("DD MMM YY")}</div>
                    <div className="col-time">{start.format("HH:mm")} - {end.format("HH:mm")}</div>
                    <div className="col-duration">{duration} min</div>
                    <div className="col-room">
                      {meeting.roomName ? (
                        <>
                          <FaMapMarkerAlt className="room-icon" />
                          {meeting.roomName}
                        </>
                      ) : (
                        <span className="no-room">-</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination">
                <button
                  className="pagination-btn"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  <FaChevronLeft /> Previous
                </button>
                <div className="pagination-info">
                  Page {currentPage} of {totalPages} ({sortedMeetings.length} meetings)
                </div>
                <button
                  className="pagination-btn"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next <FaChevronRight />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default History;

