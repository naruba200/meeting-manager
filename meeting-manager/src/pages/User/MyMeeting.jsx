import React, { useState, useEffect } from "react";
import { FaPlus, FaSearch, FaCalendarAlt, FaCheckCircle, FaClock, FaEye, FaEdit, FaTrash, FaBox, FaShoppingCart, FaUsers, FaList, FaPencilAlt, FaSave } from "react-icons/fa";
import moment from "moment-timezone";
import "../../assets/styles/UserCSS/MyMeeting.css";
import {
  initMeeting,
  createMeetingRoom,
  filterPhysicalRooms,
  assignPhysicalRoom,
  getMeetingsByOrganizer,
  updateMeeting,
  cancelMeeting,
  getPhysicalRoomById,
  updateMeetingRoom,
  getAvailableEquipment,
  bookEquipment,
  getBookingsByUser,
  updateBookingQuantity,
  cancelBooking,
  inviteToMeeting,
} from "../../services/meetingServiceUser.js";
import Datetime from "react-datetime";
import "react-datetime/css/react-datetime.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Helper function to extract message inside quotation marks
const extractQuotedMessage = (errorMessage) => {
  const match = errorMessage.match(/"([^"]+)"/); // Matches text inside quotes
  return match ? match[1] : errorMessage; // Return quoted text or original message if no quotes
};

const MyMeeting = () => {
  const [search, setSearch] = useState("");
  const [meetings, setMeetings] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [step, setStep] = useState(1);
  const [meetingId, setMeetingId] = useState(null);
  const [roomId, setRoomId] = useState(null);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [selectedPhysicalRoom, setSelectedPhysicalRoom] = useState(null);
  const [originalPhysicalRoom, setOriginalPhysicalRoom] = useState(null);
  const [assignedRoom, setAssignedRoom] = useState(null);
  const [availableEquipment, setAvailableEquipment] = useState([]);
  const [selectedEquipment, setSelectedEquipment] = useState([]);
  const [meetingBookings, setMeetingBookings] = useState([]);
  const [editingBookingId, setEditingBookingId] = useState(null);
  const [tempQuantity, setTempQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isViewMode, setIsViewMode] = useState(false);
  const [isCreateMode, setIsCreateMode] = useState(false);

  // Invite Modal States
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteMeetingId, setInviteMeetingId] = useState(null);
  const [inviteeEmailsInput, setInviteeEmailsInput] = useState("");
  const [inviteMessage, setInviteMessage] = useState("");
  const [isSendingInvite, setIsSendingInvite] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
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
          console.log("Dữ liệu từ API:", data);
          setMeetings(data);
        }
      } catch (error) {
        toast.error("❌ Error loading meetings!");
        console.error("Error fetching meetings:", error);
      }
    };
    fetchMeetings();
  }, [organizerId]);

  useEffect(() => {
    if (showModal && !isCreateMode && meetingId && organizerId) {
      const loadMeetingBookings = async () => {
        try {
          const bookings = await getBookingsByUser(organizerId, 0, 20);
          const filteredBookings = bookings.filter(booking => {
            const meetingStart = moment(form.startTime);
            const meetingEnd = moment(form.endTime);
            const bookingStart = moment(booking.startTime);
            const bookingEnd = moment(booking.endTime);
            return bookingStart.isSameOrBefore(meetingEnd) && bookingEnd.isSameOrAfter(meetingStart);
          });
          setMeetingBookings(filteredBookings);
        } catch (error) {
          toast.error("❌ Error loading equipment bookings for this meeting!");
          console.error("Error fetching bookings:", error);
          setMeetingBookings([]);
        }
      };
      loadMeetingBookings();
    }
  }, [showModal, isCreateMode, meetingId, organizerId, form.startTime, form.endTime]);

  useEffect(() => {
    if (showModal && isCreateMode && step === 4 && roomId && form.startTime && form.endTime) {
      const loadEquipment = async () => {
        try {
          const equipmentList = await getAvailableEquipment({
            roomId,
            startTime: form.startTime,
            endTime: form.endTime,
          });
          setAvailableEquipment(equipmentList || []);
        } catch (error) {
          toast.error("❌ Error loading available equipment!");
          console.error("Error fetching equipment:", error);
          setAvailableEquipment([]);
        }
      };
      loadEquipment();
    }
  }, [step, roomId, form.startTime, form.endTime, showModal, isCreateMode]);

  useEffect(() => {
    if (showModal && isCreateMode && form.roomType === "PHYSICAL" && roomId && form.startTime && form.endTime) {
      const filterData = {
        roomId,
        capacity: form.participants,
        startTime: form.startTime,
        endTime: form.endTime,
      };
      filterPhysicalRooms(filterData).then(setAvailableRooms).catch(console.error);
    }
  }, [form.roomType, form.startTime, form.endTime, roomId, showModal, isCreateMode]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleOpenModal = (meeting = null, viewMode = false) => {
    if (meeting) {
      console.log("Meeting data:", meeting);
      setIsCreateMode(false);
      setIsViewMode(viewMode);
      setForm({
        title: meeting.title,
        description: meeting.description || "",
        startTime: meeting.startTime,
        endTime: meeting.endTime,
        roomType: meeting.roomType || "PHYSICAL",
        roomName: meeting.roomName || "",
        status: meeting.status || "",
        participants: meeting.participants || 1,
      });
      setMeetingId(meeting.meetingId);
      setRoomId(meeting.roomId);
      setSelectedPhysicalRoom(meeting.physicalId || null);
      setOriginalPhysicalRoom(meeting.physicalId || null);
      setAssignedRoom(meeting.location ? { location: meeting.location } : null);
      setSelectedEquipment([]);
      setMeetingBookings([]);
      setEditingBookingId(null);
      if (meeting.roomType === "PHYSICAL" && meeting.physicalId) {
        getPhysicalRoomById(meeting.physicalId)
            .then((room) => {
              console.log("Assigned Room from API:", room);
              setAssignedRoom(room);
            })
            .catch((error) => {
              console.error("Lỗi khi tải thông tin phòng:", error.response ? error.response.data : error.message);
              toast.error("❌ Lỗi khi tải thông tin phòng vật lý!");
            });
      }
    } else {
      setIsCreateMode(true);
      setIsViewMode(false);
      setForm({
        title: "",
        description: "",
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
      setAvailableRooms([]);
      setAvailableEquipment([]);
      setSelectedEquipment([]);
      setMeetingBookings([]);
      setEditingBookingId(null);
      setStep(1);
    }
    setIsLoading(false);
    setTimeout(() => setShowModal(true), 0);
  };

  const handleOpenInviteModal = (meetingId) => {
    setInviteMeetingId(meetingId);
    setInviteeEmailsInput(""); // Clear previous input
    setInviteMessage(""); // Clear previous message
    setShowInviteModal(true);
  };

  const handleEditQuantity = (bookingId, currentQuantity) => {
    setEditingBookingId(bookingId);
    setTempQuantity(currentQuantity);
  };

  const handleSaveQuantity = async (bookingId) => {
    setIsLoading(true);
    try {
      await updateBookingQuantity(bookingId, tempQuantity);
      setMeetingBookings(prev =>
        prev.map(b =>
          b.bookingId === bookingId ? { ...b, quantity: tempQuantity } : b
        )
      );
      setEditingBookingId(null);
      toast.success(" Số lượng thiết bị đã được cập nhật thành công!");
    } catch (error) {
      const errorMessage = error.response?.data?.message || "❌ Error updating booking quantity!";
      toast.error(extractQuotedMessage(errorMessage));
      console.error("Error updating booking quantity:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId, equipmentName) => {
    if (!window.confirm(`Bạn có chắc muốn hủy booking thiết bị "${equipmentName}"?`)) return;
    setIsLoading(true);
    try {
      await cancelBooking(bookingId);
      setMeetingBookings(prev => prev.filter(b => b.bookingId !== bookingId));
      toast.success(" Đã hủy booking thiết bị thành công!");
    } catch (error) {
      const errorMessage = error.response?.data?.message || "❌ Error canceling booking!";
      toast.error(extractQuotedMessage(errorMessage));
      console.error("Error canceling booking:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingBookingId(null);
    setTempQuantity(1);
  };

  const handleInitMeeting = async () => {
    setIsLoading(true);
    try {
      const res = await initMeeting({
        title: form.title,
        description: form.description,
        startTime: form.startTime,
        endTime: form.endTime,
        organizerId: organizerId,
      });
      toast.success(res.message);
      setMeetingId(res.meetingId);
      setStep(2);
    } catch (error) {
      const errorMessage = error.response?.data?.message || "❌ Error creating meeting!";
      toast.error(extractQuotedMessage(errorMessage));
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

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
      const errorMessage = error.response?.data?.message || "❌ Error creating room!";
      toast.error(extractQuotedMessage(errorMessage));
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

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
      const errorMessage = error.response?.data?.message || "❌ Error filtering available rooms!";
      toast.error(extractQuotedMessage(errorMessage));
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
      toast.success(" Room assigned successfully!");
      setStep(4);
    } catch (error) {
      const errorMessage = error.response?.data?.message || "❌ Error assigning room!";
      toast.error(extractQuotedMessage(errorMessage));
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectEquipment = (equipmentId, quantity) => {
    if (quantity > 0) {
      setSelectedEquipment((prev) => {
        const existing = prev.find((item) => item.equipmentId === equipmentId);
        if (existing) {
          return prev.map((item) =>
            item.equipmentId === equipmentId ? { ...item, quantity } : item
          );
        }
        return [...prev, { equipmentId, quantity }];
      });
    } else {
      setSelectedEquipment((prev) => prev.filter((item) => item.equipmentId !== equipmentId));
    }
  };

  const handleFinishMeeting = async () => {
    setIsLoading(true);
    try {
      const bookPromises = selectedEquipment.map((item) =>
        bookEquipment({
          equipmentId: item.equipmentId,
          roomId,
          startTime: form.startTime,
          endTime: form.endTime,
          userId: organizerId,
          quantity: item.quantity,
        })
      );

      const bookResults = await Promise.allSettled(bookPromises);
      const successCount = bookResults.filter((r) => r.status === "fulfilled").length;
      const errorCount = bookResults.filter((r) => r.status === "rejected").length;

      if (successCount > 0) {
        toast.success(` ${successCount} thiết bị đã được đặt thành công!`);
      }
      if (errorCount > 0) {
        toast.warning(`⚠️ ${errorCount} thiết bị không thể đặt.`);
      }

      toast.success(" Meeting created successfully!");
      const updatedMeetings = await getMeetingsByOrganizer(organizerId);
      setMeetings(updatedMeetings);
      resetModal();
    } catch (error) {
      const errorMessage = error.response?.data?.message || "❌ Error finishing meeting!";
      toast.error(extractQuotedMessage(errorMessage));
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateMeeting = async () => {
    setIsLoading(true);
    try {
      const meetingPayload = {
        title: form.title,
        description: form.description,
        startTime: form.startTime,
        endTime: form.endTime,
        participants: form.participants,
      };
      await updateMeeting(meetingId, meetingPayload);
      toast.success(" Meeting updated successfully!");
      const updatedMeetings = await getMeetingsByOrganizer(organizerId);
      setMeetings(updatedMeetings);
      resetModal();
    } catch (error) {
      const errorMessage = error.response?.data?.message || "❌ Error updating meeting!";
      toast.error(extractQuotedMessage(errorMessage));
      console.error("Lỗi khi cập nhật meeting:", error);
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
      const errorMessage = error.response?.data?.message || "❌ Error canceling meeting!";
      toast.error(extractQuotedMessage(errorMessage));
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendInvite = async () => {
    if (!inviteeEmailsInput.trim()) {
      setInviteMessage("Please enter at least one email address.");
      return;
    }

    setIsSendingInvite(true);
    setInviteMessage("");
    const emails = inviteeEmailsInput.split(',').map(email => email.trim()).filter(email => email !== '');

    try {
      const res = await inviteToMeeting(inviteMeetingId, emails);
      toast.success(res.message || "Invitations sent successfully!");
      resetInviteModal();
    } catch (error) {
      const errorMessage = error.response?.data?.message || "❌ Error sending invitations!";
      toast.error(extractQuotedMessage(errorMessage));
      setInviteMessage(extractQuotedMessage(errorMessage));
      console.error("Error sending invitations:", error);
    } finally {
      setIsSendingInvite(false);
    }
  };

  const resetInviteModal = () => {
    setShowInviteModal(false);
    setInviteeEmailsInput("");
    setInviteMeetingId(null);
    setInviteMessage("");
    setIsSendingInvite(false);
  };

  const resetModal = () => {
    setShowModal(false);
    setStep(1);
    setForm({
      title: "",
      description: "",
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
    setAvailableEquipment([]);
    setSelectedEquipment([]);
    setMeetingBookings([]);
    setEditingBookingId(null);
    setSelectedPhysicalRoom(null);
    setOriginalPhysicalRoom(null);
    setAssignedRoom(null);
    setIsViewMode(false);
    setIsCreateMode(false);
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

  const renderBookingsList = () => (
    <div className="bookings-section">
      <div className="section-header">
        <FaList className="section-icon" /> Thiết Bị Đã Đặt Cho Cuộc Họp
      </div>
      {meetingBookings.length === 0 ? (
        <p className="no-bookings">Chưa có thiết bị nào được đặt cho cuộc họp này.</p>
      ) : (
        <div className="bookings-grid">
          {meetingBookings.map((booking) => (
            <div 
              key={booking.bookingId} 
              className={`booking-card ${editingBookingId === booking.bookingId ? 'editing' : ''}`}
            >
              <div className="booking-header">
                <div className="booking-info-left">
                  <h4 className="booking-name">{booking.equipmentName}</h4>
                  <div className="booking-code">Mã: {booking.bookingId}</div>
                </div>
                <div className={`booking-status ${booking.equipmentStatus?.toLowerCase() || 'reserved'}`}>
                  {booking.equipmentStatus || 'RESERVED'}
                </div>
              </div>
              <div className="booking-info">
                <div className="booking-details">
                  <div className="booking-quantity">
                    <span className="quantity-label">Số lượng:</span>
                    {editingBookingId === booking.bookingId ? (
                      <div className="quantity-edit-container">
                        <input
                          type="number"
                          value={tempQuantity}
                          onChange={(e) => setTempQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                          min="1"
                          className="edit-quantity-input"
                          disabled={isLoading}
                        />
                      </div>
                    ) : (
                      <div className="quantity-value">{booking.quantity}</div>
                    )}
                  </div>
                  <div className="booking-meta">
                    <div className="meta-item">
                      <FaBox className="meta-icon" />
                      <span>Thiết bị hội nghị</span>
                    </div>
                    <div className="meta-item">
                      <FaCalendarAlt className="meta-icon" />
                      <span>{moment(booking.startTime).format('DD/MM/YYYY HH:mm')}</span>
                    </div>
                  </div>
                </div>
              </div>
              {!isViewMode && (
                <div className="booking-actions">
                  {editingBookingId === booking.bookingId ? (
                    <>
                      <button
                        className="btn-save-quantity"
                        onClick={() => handleSaveQuantity(booking.bookingId)}
                        disabled={isLoading}
                        title="Lưu thay đổi"
                      >
                        <FaSave /> {isLoading ? "Đang lưu..." : "Lưu"}
                      </button>
                      <button
                        className="btn-cancel-edit"
                        onClick={handleCancelEdit}
                        disabled={isLoading}
                        title="Hủy bỏ"
                      >
                        Hủy
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        className="btn-edit-quantity"
                        onClick={() => handleEditQuantity(booking.bookingId, booking.quantity)}
                        disabled={isLoading}
                        title="Chỉnh sửa số lượng"
                      >
                        <FaPencilAlt /> Sửa SL
                      </button>
                      <button
                        className="btn-cancel-booking"
                        onClick={() => handleCancelBooking(booking.bookingId, booking.equipmentName)}
                        disabled={isLoading}
                        title="Hủy đặt thiết bị"
                      >
                        <FaTrash /> Hủy
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderCreateSteps = () => (
      <>
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
                <label>Description</label>
                <textarea
                    name="description"
                    value={form.description}
                    onChange={handleFormChange}
                    placeholder="Enter description (optional)"
                    rows="3"
                ></textarea>
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
        {step === 2 && (
            <>
              <div className="user-form-group">
                <label>Số lượng người tham gia *</label>
                <input
                    type="number"
                    name="participants"
                    value={form.participants}
                    onChange={handleFormChange}
                    placeholder="Enter number of participants"
                    min="1"
                />
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
            </>
        )}
        {step === 3 && (
            <>
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
                     Online room is ready, no physical room assignment needed.
                  </div>
              )}
            </>
        )}
        {step === 4 && (
            <>
              <p className="info-label">🔍 Select available equipment (optional):</p>
              <div className="equipment-list">
                {availableEquipment.length === 0 ? (
                    <div className="no-equipment-available">
                      No equipment available for this time slot.
                    </div>
                ) : (
                    availableEquipment.map((equip) => (
                        <div key={equip.equipmentId} className="equipment-item">
                          <div className="equipment-info">
                            <h5>{equip.equipmentName}</h5>
                            <p>{equip.description || "No description"}</p>
                            <p>Available: {equip.totalQuantity} units</p>
                          </div>
                          <div className="quantity-input">
                            <input
                                type="number"
                                min="0"
                                max={equip.totalQuantity}
                                defaultValue="0"
                                onChange={(e) => handleSelectEquipment(equip.equipmentId, parseInt(e.target.value) || 0)}
                                placeholder="Qty"
                            />
                          </div>
                        </div>
                    ))
                )}
              </div>
              {selectedEquipment.length > 0 && (
                  <div className="selected-equipment-summary">
                    <h5>Selected Equipment:</h5>
                    <ul>
                      {selectedEquipment.map((item) => (
                          <li key={item.equipmentId}>
                            Equipment {item.equipmentId}: {item.quantity} units
                          </li>
                      ))}
                    </ul>
                  </div>
              )}
            </>
        )}
      </>
  );

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
          <label>Description</label>
          <textarea
              name="description"
              value={form.description}
              onChange={handleFormChange}
              placeholder="No description provided"
              rows="3"
              disabled={true}
              readOnly={true}
          ></textarea>
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
          <label>Number of participants</label>
          <input
              type="number"
              name="participants"
              value={form.participants}
              onChange={handleFormChange}
              placeholder="Number of participants"
              disabled={true}
              readOnly={true}
              min="1"
          />
          <FaUsers className="input-icon" style={{ marginLeft: '5px', color: '#9ca3af' }} />
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
              readOnly={true}
          />
        </div>
        <div className="user-form-group">
          <label>Status</label>
          <input
              type="text"
              name="status"
              value={form.status}
              onChange={handleFormChange}
              placeholder="Meeting status"
              disabled={true}
              readOnly={true}
          />
          {renderStatusIcon(form.status)}
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
        {renderBookingsList()}
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
          <label>Description</label>
          <textarea
              name="description"
              value={form.description}
              onChange={handleFormChange}
              placeholder="Enter description (optional)"
              rows="3"
          ></textarea>
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
        <div className="user-form-group">
          <label>Number of participants *</label>
          <input
              type="number"
              name="participants"
              value={form.participants}
              onChange={handleFormChange}
              placeholder="Enter number of participants"
              min="1"
          />
          <FaUsers className="input-icon" style={{ marginLeft: '5px' }} />
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
        <div className="user-form-group">
          <label>Status</label>
          <input
              type="text"
              name="status"
              value={form.status}
              onChange={handleFormChange}
              placeholder="Meeting status"
              disabled={true}
          />
          {renderStatusIcon(form.status)}
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
        {renderBookingsList()}
      </>
  );

  const isStepValid = () => {
    if (step === 1) return form.title && form.startTime && form.endTime;
    if (step === 2) return form.roomType && form.roomName.trim() !== "" && form.participants > 0;
    if (step === 3) return form.roomType === "ONLINE" || selectedPhysicalRoom;
    if (step === 4) return true;
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
                        <button
                            className="btn-invite"
                            onClick={() => handleOpenInviteModal(meeting.meetingId)}
                            title="Invite participants"
                        >
                          <FaPlus /> Invite
                        </button>
                      </div>
                    </div>
                ))}
              </div>
          )}}
        </div>

        {showModal && (
            <div className="modal-overlay" onClick={resetModal}>
              <div className="modal-container" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <h3>
                    {isCreateMode
                        ? `Step ${step}: ${step === 1 ? "Create Meeting" : step === 2 ? "Create Meeting Room" : step === 3 ? "Assign Physical Room" : "Select Equipment"}`
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
                  {isCreateMode && (
                      <div className="step-progress">
                        <div className={`step-item ${step >= 1 ? "active" : ""}`}>1</div>
                        <div className={`step-item ${step >= 2 ? "active" : ""}`}>2</div>
                        <div className={`step-item ${step >= 3 ? "active" : ""}`}>3</div>
                        <div className={`step-item ${step >= 4 ? "active" : ""}`}>4</div>
                      </div>
                  )}

                  {isCreateMode ? renderCreateSteps() : isViewMode ? renderViewForm() : renderEditForm()}
                </div>

                <div className="modal-footer">
                  <button className="btn-cancel" onClick={resetModal}>
                    {isViewMode ? "Close" : "Cancel"}
                  </button>

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
                        {isLoading ? "Processing..." : "Next: Select Equipment"}
                      </button>
                  )}

                  {isCreateMode && step === 4 && (
                      <button
                          className="btn-save"
                          disabled={isLoading}
                          onClick={handleFinishMeeting}
                      >
                        {isLoading ? "Processing..." : "Finish & Create Meeting"}
                      </button>
                  )}

                  {!isCreateMode && !isViewMode && (
                      <button
                          className="btn-save"
                          disabled={isLoading || !form.title || !form.startTime || !form.endTime || form.participants < 1}
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

        {/* Invite Modal */}
        {showInviteModal && (
          <div className="modal-overlay" onClick={resetInviteModal}>
            <div className="modal-container" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Invite Participants</h3>
                <button className="close-btn" onClick={resetInviteModal}>
                  ×
                </button>
              </div>
              <div className="modal-body">
                <p>Enter email addresses, separated by commas, to invite to this meeting.</p>
                <div className="user-form-group">
                  <label htmlFor="inviteeEmails">Invitee Emails</label>
                  <textarea
                    id="inviteeEmails"
                    value={inviteeEmailsInput}
                    onChange={(e) => setInviteeEmailsInput(e.target.value)}
                    placeholder="e.g., email1@example.com, email2@example.com"
                    rows="4"
                    disabled={isSendingInvite}
                  ></textarea>
                </div>
                {inviteMessage && (
                  <p
                    className="status-message"
                    style={{
                      color: inviteMessage.startsWith('✅') ? 'green' : 'red',
                      fontWeight: 'bold',
                      marginBottom: '10px',
                    }}
                  >
                    {inviteMessage}
                  </p>
                )}
              </div>
              <div className="modal-footer">
                <button className="btn-cancel" onClick={resetInviteModal}>
                  Cancel
                </button>
                <button
                  className="btn-save"
                  onClick={handleSendInvite}
                  disabled={isSendingInvite || !inviteeEmailsInput.trim()}
                >
                  {isSendingInvite ? "Sending..." : "Send Invitations"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
  );
};

export default MyMeeting;
