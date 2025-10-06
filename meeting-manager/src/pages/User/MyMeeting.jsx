// MyMeeting.jsx - Đã làm lại modal
import React, { useState, useEffect } from "react";
import { FaPlus, FaSearch, FaCalendarAlt, FaUsers, FaVideo, FaBuilding } from "react-icons/fa";
import "../../assets/styles/UserCSS/MyMeeting.css";

const MyMeeting = () => {
  const [myCreatedMeetings, setMyCreatedMeetings] = useState([]);
  const [myJoinedMeetings, setMyJoinedMeetings] = useState([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null); 
  const [viewMeeting, setViewMeeting] = useState(null);


  const [form, setForm] = useState({
    title: "",
    description: "",
    startTime: "",
    endTime: "",
    participants: 1,
    roomType: "PHYSICAL",
    roomId: null,
  });

  const [suggestedRooms, setSuggestedRooms] = useState([]);
  const [activeTab, setActiveTab] = useState("created");

  useEffect(() => {
    fetchMyMeetings();
  }, []);

  const fetchMyMeetings = async () => {
    try {
      // Mock data
      setMyCreatedMeetings([
        { 
          id: 1, 
          title: "Kế hoạch Q4", 
          start: "2025-10-01T09:00", 
          end: "2025-10-01T10:30",
          roomName: "Phòng 101",
          roomType: "PHYSICAL",
          participants: 8,
          status: "SCHEDULED"
        },
      ]);
      setMyJoinedMeetings([
         {
            id: 1,
            title: "Họp dự án hệ thống quản lý phòng họp",
            description: "Thảo luận tiến độ sprint 3 và phân công task tiếp theo.",
            start: "2025-10-07T09:00:00",
            end: "2025-10-07T10:00:00",
            participants: 8,
            roomType: "PHYSICAL",
            roomName: "Phòng 101",
            location: "Tầng 1, Tòa nhà A",
            status: "upcoming"
          },
          {
            id: 2,
            title: "Weekly Meeting - Team Backend",
            description: "Tổng hợp lỗi API và kế hoạch refactor.",
            start: "2025-10-06T14:00:00",
            end: "2025-10-06T15:00:00",
            participants: 6,
            roomType: "ONLINE",
            roomName: "Zoom Meeting",
            platform: "Zoom",
            meetingLink: "https://zoom.us/j/123456789",
            status: "in_progress"
          },
      ]);
    } catch (error) {
      console.error("Error fetching meetings:", error);
    }
  };

  const handleSearch = (list) =>
    list.filter((m) =>
      m.title.toLowerCase().includes(search.toLowerCase())
    );

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    const updatedForm = { ...form, [name]: value };
    setForm(updatedForm);

    if (name === "participants" || name === "startTime" || name === "endTime" || name === "roomType") {
      fetchSuggestedRooms(updatedForm);
    }
  };

  const fetchSuggestedRooms = async (formData) => {
    if (!formData.startTime || !formData.endTime) {
      setSuggestedRooms([]);
      return;
    }

    try {
      const mockRooms = formData.roomType === "PHYSICAL" 
        ? [
            { roomId: 1, roomName: "Phòng 101", capacity: 20, type: "PHYSICAL", location: "Tầng 1" },
            { roomId: 2, roomName: "Phòng 202", capacity: 15, type: "PHYSICAL", location: "Tầng 2" },
            { roomId: 3, roomName: "Phòng 305", capacity: 25, type: "PHYSICAL", location: "Tầng 3" },
          ]
        : [
            { roomId: 4, roomName: "Zoom Pro", type: "ONLINE", platform: "Zoom" },
            { roomId: 5, roomName: "Teams Room", type: "ONLINE", platform: "Microsoft Teams" },
          ];

      const filteredRooms = formData.roomType === "PHYSICAL" 
        ? mockRooms.filter(room => room.capacity >= formData.participants)
        : mockRooms;

      setSuggestedRooms(filteredRooms);
    } catch (error) {
      console.error("Error fetching suggested rooms:", error);
      setSuggestedRooms([]);
    }
  };

  const handleAddMeeting = async () => {
    try {
      // TODO: Thay bằng API call thực tế
      console.log("Submit meeting:", form);
      
      // Thêm meeting mới vào danh sách
      const selectedRoom = suggestedRooms.find(room => room.roomId === form.roomId);
      const newMeeting = {
        id: Date.now(),
        title: form.title,
        description: form.description,
        start: form.startTime,
        end: form.endTime,
        roomName: selectedRoom ? selectedRoom.roomName : "Chưa chọn phòng",
        roomType: form.roomType,
        participants: form.participants,
        status: "SCHEDULED"
      };
      
      setMyCreatedMeetings(prev => [...prev, newMeeting]);
      
      // Reset form và đóng modal
      setForm({
        title: "",
        description: "",
        startTime: "",
        endTime: "",
        participants: 1,
        roomType: "PHYSICAL",
        roomId: null,
      });
      setShowModal(false);
      setSuggestedRooms([]);
      
    } catch (error) {
      console.error("Error creating meeting:", error);
    }
  };

  const formatDateTime = (dateTimeStr) => {
    const date = new Date(dateTimeStr);
    return `${date.toLocaleDateString('vi-VN')} ${date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`;
  };

  const getStatusBadge = (meeting) => {
    const statusConfig = {
      SCHEDULED: { label: "Đã lên lịch", class: "scheduled" },
      ONGOING: { label: "Đang diễn ra", class: "ongoing" },
      COMPLETED: { label: "Đã kết thúc", class: "completed" },
      CANCELLED: { label: "Đã hủy", class: "cancelled" },
      ACCEPTED: { label: "Đã chấp nhận", class: "accepted" },
      PENDING: { label: "Chờ xác nhận", class: "pending" },
      DECLINED: { label: "Đã từ chối", class: "declined" }
    };
    
    const config = statusConfig[meeting.status] || { label: meeting.status, class: "scheduled" };
    return <span className={`status-badge ${config.class}`}>{config.label}</span>;
  };

  const handleEditMeeting = (meeting) => {
    setIsEditing(true);
    setEditingId(meeting.id);

    const updatedForm = {
      title: meeting.title,
      description: meeting.description || "",
      startTime: meeting.start,
      endTime: meeting.end,
      participants: meeting.participants,
      roomType: meeting.roomType,
      roomId: meeting.roomId || null,
    };

    setForm(updatedForm);
    setShowModal(true);

    // 🔥 Fetch phòng gợi ý ngay khi mở modal
    fetchSuggestedRooms(updatedForm);
  };


  const handleUpdateMeeting = () => {
    setMyCreatedMeetings(prev =>
      prev.map(m =>
        m.id === editingId
          ? { ...m, ...form, start: form.startTime, end: form.endTime, roomName: "Cập nhật phòng" }
          : m
      )
    );
    setIsEditing(false);
    setEditingId(null);
    setForm({
      title: "",
      description: "",
      startTime: "",
      endTime: "",
      participants: 1,
      roomType: "PHYSICAL",
      roomId: null,
    });
    setShowModal(false);
  };

  const handleDeleteMeeting = (id) => {
  setMyCreatedMeetings(prev => prev.filter(m => m.id !== id));
};


  return (
    <div className="my-meeting-container">
      <div className="header">
        <div className="header-title">
          <h2>My Meetings</h2>
          <p>Manage your created and joined meetings</p>
        </div>
       <button 
          className="btn-add" 
          onClick={() => {
            setIsEditing(false);        // chế độ tạo
            setEditingId(null);         
            setForm({                   // reset form sạch
              title: "",
              description: "",
              startTime: "",
              endTime: "",
              participants: 1,
              roomType: "PHYSICAL",
              roomId: null,
            });
            setShowModal(true);
          }}
        >
          <FaPlus /> Tạo Meeting
        </button>
      </div>

      {/* Search */}
      <div className="search-bar">
        <FaSearch className="search-icon" />
        <input
          type="text"
          placeholder="Tìm kiếm meeting..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Tab Navigation */}
      <div className="meeting-tabs">
        <button 
          className={`tab-btn ${activeTab === "created" ? "active" : ""}`}
          onClick={() => setActiveTab("created")}
        >
          Tôi tạo ({myCreatedMeetings.length})
        </button>
        <button 
          className={`tab-btn ${activeTab === "joined" ? "active" : ""}`}
          onClick={() => setActiveTab("joined")}
        >
          Tham gia ({myJoinedMeetings.length})
        </button>
      </div>

      {/* Meetings List */}
      <div className="meetings-list">
        {activeTab === "created" ? (
          <>
            {handleSearch(myCreatedMeetings).length > 0 ? (
              handleSearch(myCreatedMeetings).map((m) => (
                <div className="meeting-card" key={m.id}>
                  <div className="meeting-header">
                    <h3>{m.title}</h3>
                    <div className="meeting-badges">
                      {getStatusBadge(m)}
                      <span className="meeting-badge created">Tôi tạo</span>
                    </div>
                  </div>
                  <div className="meeting-details">
                    <div className="detail-item">
                      <FaCalendarAlt />
                      <span>{formatDateTime(m.start)} - {formatDateTime(m.end)}</span>
                    </div>
                    <div className="detail-item">
                      {m.roomType === "PHYSICAL" ? <FaBuilding /> : <FaVideo />}
                      <span>{m.roomName} ({m.roomType === "PHYSICAL" ? "Phòng vật lý" : "Phòng online"})</span>
                    </div>
                    <div className="detail-item">
                      <FaUsers />
                      <span>{m.participants} người tham gia</span>
                    </div>
                    {m.description && (
                      <div className="detail-item">
                        <span>{m.description}</span>
                      </div>
                    )}
                  </div>
                  <div className="meeting-actions">
                    <button 
                      className="btn-edit" 
                      onClick={() => handleEditMeeting(m)}
                    >
                      Chỉnh sửa
                    </button>
                    <button 
                      className="btn-cancel"
                      onClick={() => setConfirmAction({ type: "delete", data: m.id })}
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <p>Chưa có meeting nào được tạo.</p>
              </div>
            )}
          </>
        ) : (
          <>
            {handleSearch(myJoinedMeetings).length > 0 ? (
              handleSearch(myJoinedMeetings).map((m) => (
                <div className="meeting-card" key={m.id}>
                  <div className="meeting-header">
                    <h3>{m.title}</h3>
                    <div className="meeting-badges">
                      {getStatusBadge(m)}
                      <span className="meeting-badge joined">Tham gia</span>
                    </div>
                  </div>
                  <div className="meeting-details">
                    <div className="detail-item">
                      <FaCalendarAlt />
                      <span>{formatDateTime(m.start)} - {formatDateTime(m.end)}</span>
                    </div>
                    <div className="detail-item">
                      {m.roomType === "PHYSICAL" ? <FaBuilding /> : <FaVideo />}
                      <span>{m.roomName} ({m.roomType === "PHYSICAL" ? "Phòng vật lý" : "Phòng online"})</span>
                    </div>
                    <div className="detail-item">
                      <FaUsers />
                      <span>{m.participants} người tham gia</span>
                    </div>
                  </div>
                  <div className="meeting-actions">
                    <button className="btn-view" onClick={() => setViewMeeting(m)}>
                        Xem chi tiết
                      </button>
                    {m.status === "PENDING" && (
                      <>
                        <button className="btn-accept">Chấp nhận</button>
                        <button className="btn-decline">Từ chối</button>
                      </>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <p>Chưa tham gia meeting nào.</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal Add Meeting - ĐÃ LÀM LẠI */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
               <h3>{isEditing ? "Chỉnh sửa Meeting" : "Tạo Meeting Mới"}</h3>
              <button 
                className="close-btn" 
                onClick={() => {
                  setShowModal(false);
                  setSuggestedRooms([]);
                }}
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <div className="form-group">
                <label>Tiêu đề meeting *</label>
                <input
                  type="text"
                  name="title"
                  placeholder="Nhập tiêu đề meeting"
                  value={form.title}
                  onChange={handleFormChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Mô tả</label>
                <textarea
                  name="description"
                  placeholder="Nhập mô tả meeting"
                  value={form.description}
                  onChange={handleFormChange}
                  rows="3"
                />
              </div>
              
              <div className="form-row">
                <div className="form-group with-icon">
                  <label>Thời gian bắt đầu *</label>
                  <div className="input-with-icon">
                    <FaCalendarAlt className="input-icon" />
                    <input
                      type="datetime-local"
                      name="startTime"
                      value={form.startTime}
                      onChange={handleFormChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-group with-icon">
                  <label>Thời gian kết thúc *</label>
                  <div className="input-with-icon">
                    <FaCalendarAlt className="input-icon" />
                    <input
                      type="datetime-local"
                      name="endTime"
                      value={form.endTime}
                      onChange={handleFormChange}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label>Loại phòng *</label>
                <div className="room-type-selector">
                  <button
                    type="button"
                    className={`room-type-btn ${form.roomType === "PHYSICAL" ? "active" : ""}`}
                    onClick={() => {
                      setForm({...form, roomType: "PHYSICAL", roomId: null});
                      fetchSuggestedRooms({...form, roomType: "PHYSICAL"});
                    }}
                  >
                    <FaBuilding />
                    Phòng vật lý
                  </button>
                  <button
                    type="button"
                    className={`room-type-btn ${form.roomType === "ONLINE" ? "active" : ""}`}
                    onClick={() => {
                      setForm({...form, roomType: "ONLINE", roomId: null});
                      fetchSuggestedRooms({...form, roomType: "ONLINE"});
                    }}
                  >
                    <FaVideo />
                    Phòng online
                  </button>
                </div>
              </div>

              {form.roomType === "PHYSICAL" && (
                <div className="form-group">
                  <label>Số lượng người tham gia *</label>
                  <input
                    type="number"
                    name="participants"
                    placeholder="Nhập số lượng người tham gia"
                    value={form.participants}
                    onChange={handleFormChange}
                    min="1"
                    required
                  />
                </div>
              )}

              {/* Suggested rooms */}
              {suggestedRooms.length > 0 && (
                <div className="suggested-rooms">
                  <h4>Phòng được đề xuất</h4>
                  <p>Dựa trên tiêu chí của bạn, các phòng sau có sẵn:</p>
                  <div className="rooms-list">
                    {suggestedRooms.map((room) => (
                      <div 
                        key={room.roomId} 
                        className={`room-item ${form.roomId === room.roomId ? "selected" : ""}`}
                        onClick={() => setForm({ ...form, roomId: room.roomId })}
                      >
                        <div className="room-info">
                          <h5>{room.roomName}</h5>
                          <p>
                            {room.type === "PHYSICAL" 
                              ? `Sức chứa: ${room.capacity} người • ${room.location}`
                              : `Nền tảng: ${room.platform}`
                            }
                          </p>
                        </div>
                        {form.roomId === room.roomId && (
                          <div className="selected-indicator">✓</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Khi không có phòng nào */}
              {suggestedRooms.length === 0 && !isEditing && (form.startTime && form.endTime) && (
                <div className="no-rooms-available">
                  <p>Không có phòng nào khả dụng trong khoảng thời gian này.</p>
                </div>
              )}
            </div>

            <div className="modal-footer">
              
              <button className="btn-cancel" onClick={() => {
                setShowModal(false);
                setSuggestedRooms([]);
              }}>
                Hủy
              </button>
              
              {isEditing ? (
                <button 
                    className="btn-save" 
                    onClick={() => setConfirmAction({ type: "edit" })}
                    disabled={!form.title || !form.startTime || !form.endTime}
                  >
                    Lưu thay đổi
                  </button>
              ) : (
                <button 
                  className="btn-save" 
                  onClick={() => setConfirmAction({ type: "create" })}
                  disabled={!form.title || !form.startTime || !form.endTime || !form.roomId}
                >
                Tạo Meeting
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      {confirmAction && (
        <div className="modal-overlay">
          <div className="confirm-dialog">
            <p>
              {confirmAction.type === "create" && "Bạn có chắc muốn tạo meeting này không?"}
              {confirmAction.type === "edit" && "Bạn có chắc muốn lưu thay đổi cho meeting này không?"}
              {confirmAction.type === "delete" && "Bạn có chắc muốn xóa meeting này không?"}
            </p>
            <div className="confirm-actions">
              <button className="btn-danger" onClick={() => setConfirmAction(null)}>
                Hủy
              </button>
              <button
                className="btn-secondary"
                onClick={() => {
                  if (confirmAction.type === "create") handleAddMeeting();
                  if (confirmAction.type === "edit") handleUpdateMeeting();
                  if (confirmAction.type === "delete") handleDeleteMeeting(confirmAction.data);
                  setConfirmAction(null);
                }}
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
      {/* View Meeting Detail Modal */}
      {viewMeeting && (
        <div className="modal-overlay">
          <div className="modal-container detail-modal">
            <div className="modal-header">
              <h3>Chi tiết Meeting</h3>
              <button 
                className="close-btn" 
                onClick={() => setViewMeeting(null)}
              >
                ×
              </button>
            </div>

            <div className="modal-body">
              <div className="meeting-detail-view">
                <h4>{viewMeeting.title}</h4>
                {getStatusBadge(viewMeeting)}
                {viewMeeting.description && (
                  <p className="meeting-desc">{viewMeeting.description}</p>
                )}
                <div className="detail-item">
                  <FaCalendarAlt />
                  <span>{formatDateTime(viewMeeting.start)} - {formatDateTime(viewMeeting.end)}</span>
                </div>
                <div className="detail-item">
                  {viewMeeting.roomType === "PHYSICAL" ? <FaBuilding /> : <FaVideo />}
                  <span>{viewMeeting.roomName} ({viewMeeting.roomType === "PHYSICAL" ? "Phòng vật lý" : "Phòng online"})</span>
                </div>
                <div className="detail-item">
                  <FaUsers />
                  <span>{viewMeeting.participants} người tham gia</span>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button 
                className="btn-cancel" 
                onClick={() => setViewMeeting(null)}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyMeeting;