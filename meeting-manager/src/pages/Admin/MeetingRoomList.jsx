// MeetingRoomList.jsx
import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { FiTrash2 } from "react-icons/fi";
import SearchBar from "../../components/Searchbar";
import "../../assets/styles/UserTable.css";
import Modal from "../../components/Modal";
import { getAllMeetingRooms, deleteMeetingRoom } from "../../services/meetingRoomService";

const MeetingRoomList = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortType, setSortType] = useState("roomName-asc"); // e.g., 'roomName-asc', 'roomName-desc', 'createdAt-desc', 'createdAt-asc'
  const [error, setError] = useState("");
  const [deleteRoom, setDeleteRoom] = useState(null);
  const [meetingRooms, setMeetingRooms] = useState([]);

  // Bộ lọc theo ID
  const [minId, setMinId] = useState("");
  const [maxId, setMaxId] = useState("");

  // Phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Load meeting rooms from API
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    fetchRooms();
  }, [navigate]);

  const fetchRooms = async () => {
    try {
      const data = await getAllMeetingRooms();
      setMeetingRooms(data);
    } catch (err) {
      setError("Failed to load meeting rooms list.");
    }
  };

  // Bộ lọc và sắp xếp
  const filteredRooms = useMemo(() => {
    let filtered = meetingRooms.filter((room) => {
      const matchesSearch = [
        room.roomId,
        room.roomName,
        room.type,
        room.status,
        room.physicalId,
        room.onlineId,
        room.createdAt,
        room.updatedAt,
      ]
        .join(" ")
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

      const matchMin = minId === "" || room.roomId >= parseInt(minId);
      const matchMax = maxId === "" || room.roomId <= parseInt(maxId);
      return matchesSearch && matchMin && matchMax;
    });

    // Sort based on sortType
    const [sortBy, sortOrder] = sortType.split('-');
    if (sortBy === 'roomName') {
      filtered.sort((a, b) => {
        const nameA = (a.roomName || "").toLowerCase();
        const nameB = (b.roomName || "").toLowerCase();
        if (sortOrder === "asc") {
          return nameA.localeCompare(nameB);
        } else {
          return nameB.localeCompare(nameA);
        }
      });
    } else if (sortBy === 'createdAt') {
      filtered.sort((a, b) => {
        const dateA = new Date(a.createdAt || a.updatedAt).getTime();
        const dateB = new Date(b.createdAt || b.updatedAt).getTime();
        if (sortOrder === "asc") {
          return dateA - dateB; // Oldest first
        } else {
          return dateB - dateA; // Newest first
        }
      });
    }

    return filtered;
  }, [searchQuery, sortType, meetingRooms, minId, maxId]);

  // Phân trang
  const totalPages = Math.ceil(filteredRooms.length / itemsPerPage);
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentRooms = filteredRooms.slice(indexOfFirst, indexOfLast);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Delete meeting room
  const handleDeleteRoomClick = (room) => {
    setDeleteRoom(room);
  };

  const handleConfirmDelete = async () => {
    if (deleteRoom) {
      try {
        await deleteMeetingRoom(deleteRoom.roomId);
        setDeleteRoom(null);
        fetchRooms();
      } catch (err) {
        alert("Error deleting meeting room.");
      }
    }
  };

  // Sort options
  const sortOptions = [
    { value: "roomName-asc", label: "Room Name A-Z" },
    { value: "roomName-desc", label: "Room Name Z-A" },
    { value: "createdAt-desc", label: "Created Date Newest" },
    { value: "createdAt-asc", label: "Created Date Oldest" },
  ];

  return (
    <div>
      {/* Header with Search and Filters */}
      <div className="user-list-header">
        <div className="header-content">
          <div className="title-section">
            <h1 className="page-title">Meeting Rooms</h1>
          </div>
          <div className="filter-bar">
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            <input
              type="number"
              placeholder="Min ID"
              value={minId}
              onChange={(e) => setMinId(e.target.value)}
              className="search-input"
              style={{ width: "100px" }}
            />
            <input
              type="number"
              placeholder="Max ID"
              value={maxId}
              onChange={(e) => setMaxId(e.target.value)}
              className="search-input"
              style={{ width: "100px" }}
            />
            <select
              value={sortType}
              onChange={(e) => setSortType(e.target.value)}
              className="filter-select"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* TABLE */}
      <section className="content-section">
        {error && <div className="error-message">{error}</div>}
        <div className="table-wrapper">
          <table className="user-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Room Name</th>
                <th>Type</th>
                <th>Status</th>
                <th>Physical ID</th>
                <th>Online ID</th>
                <th>Created At</th>
                <th>Updated At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentRooms.map((room) => (
                <tr key={room.roomId}>
                  <td>{room.roomId}</td>
                  <td>{room.roomName}</td>
                  <td>{room.type}</td>
                  <td>{room.status}</td>
                  <td>{room.physicalId || "-"}</td>
                  <td>{room.onlineId || "-"}</td>
                  <td>{room.createdAt}</td>
                  <td>{room.updatedAt || "-"}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="action-btn delete-btn"
                        onClick={() => handleDeleteRoomClick(room)}
                      >
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {currentRooms.length === 0 && !error && (
                <tr>
                  <td colSpan={9} style={{ textAlign: "center", padding: "24px" }}>
                    No meeting rooms found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="pagination">
          <button
            className={`page-btn ${currentPage === 1 ? "disabled" : ""}`}
            disabled={currentPage === 1}
            onClick={() => handlePageChange(currentPage - 1)}
          >
            Previous
          </button>

          {[...Array(totalPages)].map((_, index) => (
            <button
              key={index}
              className={`page-btn ${currentPage === index + 1 ? "active" : ""}`}
              onClick={() => handlePageChange(index + 1)}
            >
              {index + 1}
            </button>
          ))}

          <button
            className={`page-btn ${currentPage === totalPages ? "disabled" : ""}`}
            disabled={currentPage === totalPages}
            onClick={() => handlePageChange(currentPage + 1)}
          >
            Next
          </button>
        </div>
      </section>

      {/* Delete Confirmation Modal */}
      {deleteRoom && (
        <Modal title="Delete Confirmation" onClose={() => setDeleteRoom(null)}>
          <p>
            Are you sure you want to delete meeting room <b>{deleteRoom.roomName}</b>?
          </p>
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "10px",
              marginTop: "15px",
            }}
          >
            <button className="btn-secondary" onClick={() => setDeleteRoom(null)}>
              Cancel
            </button>
            <button
              className="btn-danger"
              onClick={handleConfirmDelete}
            >
              Delete
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default MeetingRoomList;