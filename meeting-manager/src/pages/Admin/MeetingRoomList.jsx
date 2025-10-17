import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import SearchBar from "../../components/Searchbar";
import "../../assets/styles/UserTable.css";
import Modal from "../../components/Modal";
import { getAllMeetingRooms, deleteMeetingRoom } from "../../services/meetingRoomService";

const MeetingRoomList = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState("roomIdDesc");
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

    switch (sortOption) {
      case "nameAsc":
        filtered.sort((a, b) => a.roomName.localeCompare(b.roomName));
        break;
      case "nameDesc":
        filtered.sort((a, b) => b.roomName.localeCompare(a.roomName));
        break;
      case "roomIdDesc":
      default:
        filtered.sort((a, b) => b.roomId - a.roomId);
        break;
    }
    return filtered;
  }, [searchQuery, sortOption, meetingRooms, minId, maxId]);

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

  return (
    <div>
      {/* Thanh tìm kiếm */}
      <SearchBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        sortOption={sortOption}
        setSortOption={setSortOption}
        showAdd={false}
      />

      

      {/* Meeting Room Table */}
      <section className="content">
        <h1 className="page-title">MEETING ROOM LIST</h1>
        {error && <div style={{ color: "red" }}>{error}</div>}
        <div className="table-container">
          <table className="user-table">
            <thead>
              <tr>
                <th>Room ID</th>
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
                        className="delete-button"
                        onClick={() => handleDeleteRoomClick(room)}
                      >
                        ✗
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
        <div className="pagination" style={{ marginTop: "20px", textAlign: "center" }}>
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            style={{ margin: "0 5px" }}
          >
            ← Prev
          </button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => handlePageChange(i + 1)}
              className={currentPage === i + 1 ? "active-page" : ""}
              style={{
                margin: "0 4px",
                background: currentPage === i + 1 ? "#007bff" : "white",
                color: currentPage === i + 1 ? "white" : "#007bff",
                border: "1px solid #007bff",
                borderRadius: "5px",
                padding: "5px 10px",
              }}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            style={{ margin: "0 5px" }}
          >
            Next →
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
            <button onClick={() => setDeleteRoom(null)}>Cancel</button>
            <button
              style={{ background: "#e74c3c", color: "#fff" }}
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
