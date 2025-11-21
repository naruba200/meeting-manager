import React, { useState, useEffect } from "react";
import { FaRedo, FaPlus } from "react-icons/fa";
import { makeRecurring } from "../../services/RecurringService.js";
import {
  FaSearch, FaCalendarAlt, FaCheckCircle, FaClock, FaEye, FaEdit, FaTrash,
  FaBox, FaShoppingCart, FaUsers, FaList, FaPencilAlt, FaSave, FaUndo
} from "react-icons/fa";
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
  getAvailableEquipment,
  bookEquipment,
  getBookingsByUser,
  updateBookingQuantity,
  cancelBooking,
  inviteToMeeting,
  getMeetingParticipants,
  removeParticipant,
  filterMeetingsByDate
} from "../../services/meetingServiceUser.js";
import Datetime from "react-datetime";
import "react-datetime/css/react-datetime.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaQrcode } from "react-icons/fa";
import QrModal from "../../components/QrModal";

// Helper function to extract message inside quotation marks
const extractQuotedMessage = (errorMessage) => {
  const match = errorMessage.match(/"([^"]+)"/);
  return match ? match[1] : errorMessage;
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
  const [assignedRoom, setAssignedRoom] = useState(null);
  const [availableEquipment, setAvailableEquipment] = useState([]);
  const [selectedEquipment, setSelectedEquipment] = useState([]);
  const [meetingBookings, setMeetingBookings] = useState([]);
  const [editingBookingId, setEditingBookingId] = useState(null);
  const [tempQuantity, setTempQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isViewMode, setIsViewMode] = useState(false);
  const [isCreateMode, setIsCreateMode] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showQrModal, setShowQrModal] = useState(false);
  const [selectedMeetingId, setSelectedMeetingId] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false); // Thêm trạng thái dark mode
  const [isRecurringMode, setIsRecurringMode] = useState(false);

  // Invite Modal States
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteMeetingId, setInviteMeetingId] = useState(null);
  const [inviteeEmailsInput, setInviteeEmailsInput] = useState("");
  const [inviteMessage, setInviteMessage] = useState("");
  const [isSendingInvite, setIsSendingInvite] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [stagedDeletions, setStagedDeletions] = useState([]);

  // THÊM: States cho modal chọn thêm equipment trong edit mode
  const [showAddEquipmentModal, setShowAddEquipmentModal] = useState(false);
  const [addEquipmentSelected, setAddEquipmentSelected] = useState([]);

  const [form, setForm] = useState({
    title: "",
    description: "",
    startTime: "",
    endTime: "",
    roomType: "PHYSICAL",
    roomName: "",
    status: "",
    participants: 1,
    recurrenceType: "DAILY",
    recurUntil: "",
    maxOccurrences: "",
  });

  const user = JSON.parse(localStorage.getItem("user"));
  const organizerId = user?.userId;

  // Lắng nghe và đồng bộ dark mode
  useEffect(() => {
    // Áp dụng dark mode từ localStorage ngay khi mount
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      setIsDarkMode(true);
      document.documentElement.classList.add("dark");
    }

    // Lắng nghe message từ parent
    const handleMessage = (event) => {
      if (event.data.type === "toggleDarkMode") {
        setIsDarkMode(event.data.isDark);
        if (event.data.isDark) {
          document.documentElement.classList.add("dark");
          localStorage.setItem("theme", "dark");
        } else {
          document.documentElement.classList.remove("dark");
          localStorage.setItem("theme", "light");
        }
      }
    };

    window.addEventListener("message", handleMessage);

    // Yêu cầu trạng thái dark mode từ parent khi iframe sẵn sàng
    window.parent.postMessage({ type: "requestDarkMode" }, "*");

    return () => window.removeEventListener("message", handleMessage);
  }, []);

  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        if (organizerId) {
          const data = await getMeetingsByOrganizer(organizerId);
          console.log("Data from Backend:", data);
          setMeetings(data);
        }
      } catch (error) {
        toast.error("Error loading meetings!");
        console.error("Error fetching meetings:", error);
      }
    };
    fetchMeetings();
  }, [organizerId]);

  const handleFilter = async () => {
    if (!startDate || !endDate) {
      alert("Please select both start time and end time!");
      return;
    }

    const startDateTime = `${startDate}T00:00:00`;
    const endDateTime = `${endDate}T23:59:59`;

    try {
      const data = await filterMeetingsByDate(startDateTime, endDateTime);
      setMeetings(data);
    } catch (error) {
      console.error("Error when filter:", error);
    }
  };

  const handleClearFilter = async () => {
    setStartDate("");
    setEndDate("");
    try {
      if (organizerId) {
        const data = await getMeetingsByOrganizer(organizerId);
        setMeetings(data);
      }
    } catch (error) {
      console.error("Error resetting meetings:", error);
      toast.error("❌ Error clearing filter!");
    }
  };

  useEffect(() => {
    console.log("useEffect bookings chạy! roomId =", roomId, "meetingId =", meetingId, "showModal =", showModal, "isCreateMode =", isCreateMode);

    if (showModal && !isCreateMode && meetingId && organizerId && roomId) {
      console.log("ĐỦ ĐIỀU KIỆN → BẮT ĐẦU LOAD BOOKINGS CHO ROOM ID =", roomId);

      const loadMeetingBookings = async () => {
        try {
          const bookings = await getBookingsByUser(organizerId, 0, 20);
          console.log("Tất cả booking trả về từ API:", bookings);

          const filteredBookings = bookings.filter(booking => {
            const match = booking.roomId == roomId &&  // dùng == thay vì === (phòng trường hợp number vs string)
                moment(booking.startTime).isBefore(moment(form.endTime)) &&
                moment(booking.endTime).isAfter(moment(form.startTime));

            if (match) {
              console.log("MATCH → booking này thuộc meeting hiện tại:", booking);
            }
            return match;
          });

          console.log("Số booking sau khi filter:", filteredBookings.length);
          console.log("Danh sách booking sẽ hiển thị:", filteredBookings);

          setMeetingBookings(filteredBookings);
        } catch (error) {
          console.error("LỖI KHI GỌI getBookingsByUser:", error);
          toast.error("Error loading equipment!");
          setMeetingBookings([]);
        }
      };

      loadMeetingBookings();
    } else {
      console.log("CHƯA ĐỦ ĐIỀU KIỆN để load booking (một trong các giá trị còn thiếu)");
    }
  }, [showModal, isCreateMode, meetingId, organizerId, form.startTime, form.endTime, roomId]);

  useEffect(() => {
    if (showModal && isCreateMode && step === 4 && roomId && form.startTime && form.endTime) {
      const loadEquipment = async () => {
        try {
          const equipmentList = await getAvailableEquipment({
            roomId,
            startTime: form.startTime,
            endTime: form.endTime,
          });
          console.log("Loaded equipment with remaining quantities:", equipmentList);  // Debug log
          setAvailableEquipment(equipmentList || []);
        } catch (error) {
          toast.error("Error loading available equipment!");
          console.error("Error fetching equipment:", error);
          setAvailableEquipment([]);
        }
      };
      loadEquipment();
    }
  }, [step, roomId, form.startTime, form.endTime, showModal, isCreateMode]);

  // THÊM: useEffect load available equipment cho edit mode khi mở modal thêm
  useEffect(() => {
    if (showAddEquipmentModal && roomId && form.startTime && form.endTime) {
      const loadAddEquipment = async () => {
        try {
          const equipmentList = await getAvailableEquipment({
            roomId,
            startTime: form.startTime,
            endTime: form.endTime,
          });
          console.log("Loaded add equipment:", equipmentList);
          setAvailableEquipment(equipmentList || []);
          setAddEquipmentSelected([]);  // Reset selection
        } catch (error) {
          toast.error("Error loading available equipment for add!");
          console.error("Error:", error);
        }
      };
      loadAddEquipment();
    }
  }, [showAddEquipmentModal, roomId, form.startTime, form.endTime]);

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
  }, [form.roomType, form.startTime, form.endTime, roomId, showModal, isCreateMode, form.participants]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleOpenModal = (meeting = null, viewMode = false, recurring = false) => {
    setIsRecurringMode(recurring);

    if (meeting) {
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
      setAssignedRoom(meeting.location ? { location: meeting.location } : null);
      setSelectedEquipment([]);
      setMeetingBookings([]);
      setEditingBookingId(null);

      if (meeting.meetingId) {
        getMeetingParticipants(meeting.meetingId)
            .then(setParticipants)
            .catch(() => toast.error("Error loading participants!"));
      }

      if (meeting.roomType === "PHYSICAL" && meeting.physicalId) {
        getPhysicalRoomById(meeting.physicalId)
            .then(setAssignedRoom)
            .catch(() => toast.error("Error when loading physical room's information!"));
      }
    } else {
      setIsCreateMode(true);
      setIsViewMode(false);
      setForm({
        title: "", description: "", startTime: "", endTime: "",
        roomType: "PHYSICAL", roomName: "", participants: 1,
        recurrenceType: "DAILY", recurUntil: "", maxOccurrences: ""
      });
      setMeetingId(null);
      setRoomId(null);
      setSelectedPhysicalRoom(null);
      setAssignedRoom(null);
      setAvailableRooms([]);
      setAvailableEquipment([]);
      setSelectedEquipment([]);
      setMeetingBookings([]);
      setEditingBookingId(null);
      setStep(1);
    }
    setShowModal(true);  // BỎ setTimeout, bật trực tiếp
  };

  const handleOpenInviteModal = (meetingId) => {
    setInviteMeetingId(meetingId);
    setInviteeEmailsInput("");
    setInviteMessage("");
    setShowInviteModal(true);
  };

  // THÊM: Handler mở modal thêm equipment
  const handleOpenAddEquipment = () => {
    if (!roomId || !form.startTime || !form.endTime) {
      toast.error("Cant add equipment: missing room or time range!");
      return;
    }
    setShowAddEquipmentModal(true);
  };

  // THÊM: Handler đóng modal thêm equipment
  const handleCloseAddEquipment = () => {
    setShowAddEquipmentModal(false);
    setAvailableEquipment([]);
    setAddEquipmentSelected([]);
  };

  // THÊM: Handler chọn equipment trong modal thêm
  const handleSelectAddEquipment = (equipmentId, quantity, remainingQuantity) => {
    if (quantity > remainingQuantity) {
      toast.error(`Cant choose over ${remainingQuantity} remaining!`);
      return;
    }
    if (quantity > 0) {
      setAddEquipmentSelected((prev) => {
        const existing = prev.find((item) => item.equipmentId === equipmentId);
        if (existing) {
          return prev.map((item) =>
              item.equipmentId === equipmentId ? { ...item, quantity } : item
          );
        }
        return [...prev, { equipmentId, quantity }];
      });
    } else {
      setAddEquipmentSelected((prev) => prev.filter((item) => item.equipmentId !== equipmentId));
    }
  };

  // THÊM: Handler lưu thêm equipment (book và cập nhật state)
  const handleSaveAddEquipment = async () => {
    if (addEquipmentSelected.length === 0) {
      toast.warning("Havent select a number to add!");
      return;
    }
    setIsLoading(true);
    try {
      const bookPromises = addEquipmentSelected.map(item =>
          bookEquipment({
            equipmentId: item.equipmentId,
            roomId,
            startTime: form.startTime,
            endTime: form.endTime,
            userId: organizerId,
            quantity: item.quantity,
          })
      );
      const results = await Promise.allSettled(bookPromises);
      const success = results.filter(r => r.status === "fulfilled").length;
      const failed = results.filter(r => r.status === "rejected").length;
      if (success > 0) toast.success(`${success} Success adding equipment!`);
      if (failed > 0) toast.warning(`${failed} Cant add equipment.`);

      // Reload meetingBookings để cập nhật
      const bookings = await getBookingsByUser(organizerId, 0, 20);
      const filteredBookings = bookings.filter(booking => {
        const mStart = moment(form.startTime);
        const mEnd = moment(form.endTime);
        const bStart = moment(booking.startTime);
        const bEnd = moment(booking.endTime);

        return booking.roomId === roomId &&
            bStart.isBefore(mEnd) &&
            bEnd.isAfter(mStart);
      });
      setMeetingBookings(filteredBookings);

      handleCloseAddEquipment();
    } catch (error) {
      toast.error("Error when add equipment: " + extractQuotedMessage(error.message));
      console.error("Error adding equipment:", error);
    } finally {
      setIsLoading(false);
    }
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
      toast.success("The selective equipment have been updated successfully!");
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Error updating booking quantity!";
      toast.error(extractQuotedMessage(errorMessage));
      console.error("Error updating booking quantity:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId, equipmentName) => {
    if (!window.confirm(`Are you sure to cancel booking "${equipmentName}"?`)) return;
    setIsLoading(true);
    try {
      await cancelBooking(bookingId);
      setMeetingBookings(prev => prev.filter(b => b.bookingId !== bookingId));
      toast.success("Cancel booking successfully!");
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Error canceling booking!";
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
      const errorMessage = error.response?.data?.message || "Error creating meeting!";
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
      const errorMessage = error.response?.data?.message || "Error creating room!";
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
      const errorMessage = error.response?.data?.message || "Error filtering available rooms!";
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
      toast.success("Room assigned successfully!");
      setStep(4);
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Error assigning room!";
      toast.error(extractQuotedMessage(errorMessage));
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectEquipment = (equipmentId, quantity, remainingQuantity) => {
    if (quantity > remainingQuantity) {
      toast.error(`Cant select over ${remainingQuantity}!`);
      return;
    }
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
      //1: BOOK THIẾT BỊ (DÙ CÓ RECURRING HAY KHÔNG)
      if (selectedEquipment.length > 0) {
        const bookPromises = selectedEquipment.map(item =>
            bookEquipment({
              equipmentId: item.equipmentId,
              roomId,
              startTime: form.startTime,
              endTime: form.endTime,
              userId: organizerId,
              quantity: item.quantity,
            })
        );
        const results = await Promise.allSettled(bookPromises);
        const success = results.filter(r => r.status === "fulfilled").length;
        const failed = results.filter(r => r.status === "rejected").length;
        if (success > 0) toast.success(`${success} Equipment booking succesfully!`);
        if (failed > 0) toast.warning(`${failed} Equipment cant be book.`);
      }

      //2: RECURRING (chỉ khi ở step 5)
      if (isRecurringMode && step === 5) {
        const payload = {
          recurrenceType: form.recurrenceType,
          recurUntil: form.recurUntil,
          maxOccurrences: form.maxOccurrences ? parseInt(form.maxOccurrences) : null,
        };
        const res = await makeRecurring(meetingId, payload, organizerId);
        toast.success(`Create ${res.count} recurring meeting succesfully!`);
      } else {
        toast.success("Meeting created successfully!");
      }

      // RELOAD + RESET
      const updated = await getMeetingsByOrganizer(organizerId);
      setMeetings(updated);
      resetModal();
    } catch (error) {
      toast.error(extractQuotedMessage(error.response?.data?.message || "Error when creating recurring meeting"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateMeeting = async () => {
    setIsLoading(true);
    try {
      for (const email of stagedDeletions) {
        await removeParticipant(meetingId, email);
      }

      const meetingPayload = {
        title: form.title,
        description: form.description,
        startTime: form.startTime,
        endTime: form.endTime,
        participants: form.participants,
      };
      await updateMeeting(meetingId, meetingPayload);
      toast.success("Meeting updated successfully!");
      const updatedMeetings = await getMeetingsByOrganizer(organizerId);
      setMeetings(updatedMeetings);
      resetModal();
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Error updating meeting!";
      toast.error(extractQuotedMessage(errorMessage));
      console.error("Error when create meeting:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteMeeting = async (meetingId) => {
    if (!window.confirm("Are you sure you want to cancel this meeting?")) return;
    setIsLoading(true);
    try {
      const res = await cancelMeeting(meetingId);
      toast.success(res.message || "Meeting canceled successfully!");
      setMeetings((prev) => prev.filter((m) => m.meetingId !== meetingId));
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Error canceling meeting!";
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
      const errorMessage = error.response?.data?.message || "Error sending invitations!";
      toast.error(extractQuotedMessage(errorMessage));
      setInviteMessage(extractQuotedMessage(errorMessage));
      console.error("Error sending invitations:", error);
    } finally {
      setIsSendingInvite(false);
    }
  };

  const handleRemoveParticipant = (email) => {
    setStagedDeletions(prev =>
        prev.includes(email) ? prev.filter(e => e !== email) : [...prev, email]
    );
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
    setIsRecurringMode(false);
    setForm({
      title: "", description: "", startTime: "", endTime: "", participants: 1,
      roomType: "PHYSICAL", roomName: "",
      recurrenceType: "DAILY", recurUntil: "", maxOccurrences: ""
    });
    setMeetingId(null);
    setRoomId(null);
    setAvailableRooms([]);
    setAvailableEquipment([]);
    setSelectedEquipment([]);
    setMeetingBookings([]);
    setEditingBookingId(null);
    setSelectedPhysicalRoom(null);
    setAssignedRoom(null);
    setStagedDeletions([]);
    setIsViewMode(false);
    setIsCreateMode(false);
    // THÊM: Reset add equipment modal
    setShowAddEquipmentModal(false);
    setAddEquipmentSelected([]);
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

  // THÊM: Render modal chọn thêm equipment (tương tự step 4 nhưng cho edit)
  const renderAddEquipmentModal = () => (
      <div className="modal-overlay" onClick={handleCloseAddEquipment}>
        <div className="modal-container" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h3>Add new equipment</h3>
            <button className="close-btn" onClick={handleCloseAddEquipment}>×</button>
          </div>
          <div className="modal-body">
            <p>Choose available equipment for: {moment(form.startTime).format('DD/MM/YYYY HH:mm')} - {moment(form.endTime).format('DD/MM/YYYY HH:mm')}</p>
            <div className="equipment-list">
              {availableEquipment.length === 0 ? (
                  <div className="no-equipment-available">No available equipment for the time.</div>
              ) : (
                  availableEquipment.map((equip) => (
                      <div key={equip.equipmentId} className="equipment-item">
                        <div className="equipment-info">
                          <h5>{equip.equipmentName}</h5>
                          <p>{equip.description || "No description"}</p>
                          <p>Total: {equip.total} units</p>
                          <p>Booked: {equip.booked || 0} units</p>
                          <p><strong>Available: {equip.remainingQuantity} units</strong></p>
                          <p>Status: {equip.status}</p>
                        </div>
                        <div className="quantity-input">
                          <input
                              type="number"
                              min="0"
                              max={equip.remainingQuantity}
                              defaultValue="0"
                              onChange={(e) => handleSelectAddEquipment(equip.equipmentId, parseInt(e.target.value) || 0, equip.remainingQuantity)}
                              placeholder="Qty"
                          />
                        </div>
                      </div>
                  ))
              )}
            </div>
            {addEquipmentSelected.length > 0 && (
                <div className="selected-equipment-summary">
                  <h5>Have selected:</h5>
                  <ul>
                    {addEquipmentSelected.map((item) => (
                        <li key={item.equipmentId}>Equipment {item.equipmentId}: {item.quantity} units</li>
                    ))}
                  </ul>
                </div>
            )}
          </div>
          <div className="modal-footer">
            <button className="btn-cancel" onClick={handleCloseAddEquipment}>Cancel</button>
            <button className="btn-save" onClick={handleSaveAddEquipment} disabled={isLoading || addEquipmentSelected.length === 0}>
              {isLoading ? "Đang thêm..." : "Thêm Thiết Bị"}
            </button>
          </div>
        </div>
      </div>
  );

  const renderBookingsList = () => (
      <div className="bookings-section">
        <div className="section-header">
          <FaList className="section-icon" /> Equipment for the meeting
          {!isViewMode && (
              <button className="btn-add-equipment" onClick={handleOpenAddEquipment} title="Thêm thiết bị mới">
                <FaPlus />
              </button>
          )}
        </div>

        {meetingBookings.length === 0 ? (
            <p className="no-bookings">There is no equipment for this meeting.</p>
        ) : (
            <div className="bookings-grid">
              {meetingBookings.map((booking) => {
                // Sửa lỗi chính tả: "Mays Chiếu" → "Máy chiếu"
                const equipmentName = booking.equipmentName === "Mays Chiếu" ? "Máy chiếu" : booking.equipmentName;

                return (
                    <div
                        key={booking.bookingId}
                        className={`booking-card ${editingBookingId === booking.bookingId ? 'editing' : ''}`}
                    >
                      {/* HEADER: Tên thiết bị + Mã + Phòng + Người đặt + Meeting ID */}
                      <div className="booking-card-header">
                        <div className="booking-main-info">
                          <h4 className="booking-name">{equipmentName}</h4>
                          <div className="booking-meta-row">
                    <span className="meta-item">
                      <strong>Id:</strong> {booking.bookingId}
                    </span>
                            <span className="meta-item">
                      <strong>Room:</strong> {booking.roomName}
                    </span>
                            <span className="meta-item">
                      <strong>Organizer:</strong> {booking.userName}
                    </span>
                          </div>
                          {booking.meetingId && (
                              <div className="meeting-id-tag">
                                <strong>Meeting ID:</strong> {booking.meetingId}
                              </div>
                          )}
                        </div>
                        <div className={`booking-status-badge ${booking.equipmentStatus?.toLowerCase()}`}>
                          {booking.equipmentStatus || "RESERVED"}
                        </div>
                      </div>

                      {/* BODY: Số lượng + Thời gian */}
                      <div className="booking-info">
                        <div className="booking-details">
                          <div className="booking-quantity">
                            <span className="quantity-label">Number:</span>
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
                              <span>Meeting's Equipment</span>
                            </div>
                            <div className="meta-item">
                              <FaCalendarAlt className="meta-icon" />
                              <span>{moment(booking.startTime).format('DD/MM/YYYY HH:mm')}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* ACTIONS: Sửa / Hủy */}
                      {!isViewMode && (
                          <div className="booking-actions">
                            {editingBookingId === booking.bookingId ? (
                                <>
                                  <button
                                      className="btn-save-quantity"
                                      onClick={() => handleSaveQuantity(booking.bookingId)}
                                      disabled={isLoading}
                                      title="Save"
                                  >
                                    <FaSave /> {isLoading ? "Đang lưu..." : "Lưu"}
                                  </button>
                                  <button
                                      className="btn-cancel-edit"
                                      onClick={handleCancelEdit}
                                      disabled={isLoading}
                                      title="Cancel"
                                  >
                                    Cancel
                                  </button>
                                </>
                            ) : (
                                <>
                                  <button
                                      className="btn-edit-quantity"
                                      onClick={() => handleEditQuantity(booking.bookingId, booking.quantity)}
                                      disabled={isLoading}
                                      title="Edit number equipment"
                                  >
                                    <FaPencilAlt /> Edit
                                  </button>
                                  <button
                                      className="btn-cancel-booking"
                                      onClick={() => handleCancelBooking(booking.bookingId, equipmentName)}
                                      disabled={isLoading}
                                      title="Cancel booking equipment"
                                  >
                                    <FaTrash /> Cancel;
                                  </button>
                                </>
                            )}
                          </div>
                      )}
                    </div>
                );
              })}
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
                <label>Number of participants *</label>
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
                    <p className="info-label">Select an available physical room:</p>
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
                                    <span className="selected-indicator">Check</span>
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
              <p className="info-label">Select available equipment (optional):</p>
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
                            <p>Total: {equip.total} units</p>
                            <p>Booked: {equip.booked || 0} units</p>
                            <p><strong>Available: {equip.remainingQuantity} units</strong></p>
                            <p>Status: {equip.status}</p>
                          </div>
                          <div className="quantity-input">
                            <input
                                type="number"
                                min="0"
                                max={equip.remainingQuantity}
                                defaultValue="0"
                                onChange={(e) => handleSelectEquipment(equip.equipmentId, parseInt(e.target.value) || 0, equip.remainingQuantity)}
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

        {isRecurringMode && step === 5 && (
            <>
              <div className="user-form-group">
                <label>Recurring *</label>
                <select name="recurrenceType" value={form.recurrenceType} onChange={handleFormChange}>
                  <option value="DAILY">Daily</option>
                  <option value="WEEKLY">Weekly</option>
                  <option value="MONTHLY">Monthly</option>
                </select>
              </div>
              <div className="user-form-group">
                <label>To  *</label>
                <div className="datetime-picker-container">
                  <Datetime
                      value={formatDate(form.recurUntil)}
                      onChange={(date) => handleDateTimeChange("recurUntil", date)}
                      dateFormat="DD/MM/YYYY"
                      timeFormat={false}
                      inputProps={{ placeholder: "Chọn ngày kết thúc", readOnly: true }}
                      closeOnSelect
                  />
                  <FaCalendarAlt className="input-icon" />
                </div>
              </div>
              <div className="user-form-group">
                <label>Maximum (select)</label>
                <input
                    type="number"
                    name="maxOccurrences"
                    value={form.maxOccurrences}
                    onChange={handleFormChange}
                    min="1"
                    placeholder="Ví dụ: 10"
                />
              </div>
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
        </div>
        {renderParticipantsList()}
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
              disabled={true}
          />
        </div>
        {renderParticipantsList()}
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
    if (step === 5) return form.recurUntil && form.recurrenceType !== "NONE";
    return false;
  };

  const renderParticipantsList = () => (
      <div className="user-form-group">
        <label><FaUsers className="section-icon" /> Participants</label>
        {participants.length === 0 ? (
            <p className="no-participants">No participants in this meeting yet.</p>
        ) : (
            <div className="participants-grid">
              {participants.map((participant) => {
                const isStagedForDeletion = stagedDeletions.includes(participant.email);
                return (
                    <div key={participant.email} className={`participant-card ${isStagedForDeletion ? 'staged-for-deletion' : ''}`}>
                      <div className="participant-info">
                        <h4 className="participant-name">{participant.fullName}</h4>
                        <p className="participant-email">{participant.email}</p>
                      </div>
                      {!isViewMode && (
                          <div className="participant-actions">
                            <button
                                className={`btn-remove-participant ${isStagedForDeletion ? 'btn-undo' : ''}`}
                                onClick={() => handleRemoveParticipant(participant.email)}
                                disabled={isLoading}
                                title={isStagedForDeletion ? "Undo remove" : "Remove participant"}
                            >
                              {isStagedForDeletion ? <FaUndo /> : <FaTrash />}
                            </button>
                          </div>
                      )}
                    </div>
                );
              })}
            </div>
        )}
      </div>
  );

  return (
      <div className={`my-meeting-container ${isDarkMode ? "dark" : ""}`}>
        <ToastContainer position="top-right" autoClose={2500} hideProgressBar />

      {/* Header */}
      <div className="user-header">
        <div className="header-title">
          <h2>My Meetings</h2>
          <p>List of meetings you have created</p>
        </div>

        {/* Bộ lọc ngày */}
        <div className="filter-container">
          <div>
            <label>From: </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div>
            <label>To: </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <button className="filter-btn" onClick={handleFilter}>
            Filter
          </button>
          <button className="clear-filter-btn" onClick={handleClearFilter}>
            Clear Fiter
          </button>
        </div>
          {/* Nút tạo meeting */}
          <button className="btn-add-meeting" onClick={() => handleOpenModal(null)}>
            <FaPlus /> Create Meeting
          </button>
          <button
              className="btn-add-meeting"
              style={{ background: "linear-gradient(135deg, #7c3aed, #a78bfa)" }}
              onClick={() => handleOpenModal(null, false, true)} // Recurring
          >
            <FaRedo /> Create Recurring
          </button>
        </div>

        {/* Thanh tìm kiếm */}
        <div className="search-bar">
          <FaSearch className="search-icon" />
          <input
              type="text"
              placeholder="Search meetings..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Danh sách meeting */}
        <div className="meetings-cards-container">
          {filteredMeetings.length === 0 ? (
              <div className="empty-state">
                <FaCalendarAlt
                    style={{ fontSize: "48px", color: "#9ca3af", marginBottom: "16px" }}
                />
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

                      <div className="card-body with-qr">
                        <div className="info-section">
                          <p>
                            <strong>Start:</strong>{" "}
                            {moment
                                .tz(meeting.startTime, "Asia/Ho_Chi_Minh")
                                .format("DD/MM/YYYY HH:mm:ss")}
                          </p>
                          <p>
                            <strong>End:</strong>{" "}
                            {moment
                                .tz(meeting.endTime, "Asia/Ho_Chi_Minh")
                                .format("DD/MM/YYYY HH:mm:ss")}
                          </p>
                          <p>
                            <strong>Room:</strong> {meeting.roomName}
                          </p>
                        </div>

                        <button
                            className="btn-qr align-right"
                            onClick={() => {
                              setSelectedMeetingId(meeting.meetingId);
                              setShowQrModal(true);
                            }}
                        >
                          <FaQrcode /> QR
                        </button>
                      </div>

                      <div className="card-footer">
                        <button className="btn-view" onClick={() => handleOpenModal(meeting, true)}>
                          <FaEye /> View
                        </button>
                        <button className="btn-edit-meeting" onClick={() => handleOpenModal(meeting, false)}>
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
          )}
        </div>

        {/* Modal tạo/sửa meeting */}
        {showModal && (
            <div className="modal-overlay">
              <div className="modal-container" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <h3>
                    {isCreateMode
                        ? `Step ${step}: ${
                            step === 1
                                ? "Create Meeting"
                                : step === 2
                                    ? "Create Meeting Room"
                                    : step === 3
                                        ? "Assign Physical Room"
                                        : "Select Equipment"
                        }`
                        : isViewMode
                            ? "View Meeting Details"
                            : "Edit Meeting"}
                  </h3>
                  <button className="close-btn" onClick={resetModal}>
                    ×
                  </button>
                </div>

                <div className="modal-body">
                  {isCreateMode && (
                      <div className="step-progress">
                        {[1, 2, 3, 4, ...(isRecurringMode ? [5] : [])].map((i) => (
                            <div key={i} className={`step-item ${step >= i ? "active" : ""}`}>
                              {i}
                            </div>
                        ))}
                      </div>
                  )}

                  {isCreateMode
                      ? renderCreateSteps()
                      : isViewMode
                          ? renderViewForm()
                          : renderEditForm()}
                </div>

                <div className="modal-footer">
                  <button className="btn-cancel" onClick={resetModal}>
                    {isViewMode ? "Close" : "Cancel"}
                  </button>

                  {isCreateMode && step > 1 && (
                      <button className="btn-secondary" onClick={() => setStep((prev) => prev - 1)}>
                        Back
                      </button>
                  )}

                  {/* Các bước */}
                  {isCreateMode && step === 1 && (
                      <button
                          className="btn-save"
                          disabled={isLoading || !isStepValid()}
                          onClick={handleInitMeeting}
                      >
                        {isLoading ? "Processing..." : "Continue"}
                      </button>
                  )}
                  {isCreateMode && step === 2 && (
                      <button
                          className="btn-save"
                          disabled={isLoading || !isStepValid()}
                          onClick={handleCreateRoom}
                      >
                        {isLoading ? "Creating..." : "Create Room"}
                      </button>
                  )}
                  {isCreateMode && step === 3 && (
                      <button
                          className="btn-save"
                          disabled={isLoading || !isStepValid()}
                          onClick={handleAssignRoom}
                      >
                        {isLoading ? "Processing..." : "Next"}
                      </button>
                  )}
                  {isCreateMode && step === 4 && !isRecurringMode && (
                      <button
                          className="btn-save"
                          disabled={isLoading}
                          onClick={handleFinishMeeting}
                      >
                        {isLoading ? "Creating..." : "Finish & Create"}
                      </button>
                  )}
                  {isCreateMode && isRecurringMode && step === 4 && (
                      <button
                          className="btn-save"
                          disabled={isLoading}
                          onClick={() => setStep(5)}
                      >
                        {isLoading ? "Processing..." : "Next → Recurring Settings"}
                      </button>
                  )}
                  {isCreateMode && isRecurringMode && step === 5 && (
                      <button
                          className="btn-save"
                          disabled={isLoading || !isStepValid()}
                          onClick={handleFinishMeeting}
                          style={{ background: "linear-gradient(135deg, #7c3aed, #a78bfa)" }}
                      >
                        {isLoading ? "Creating..." : "Create Recurring"}
                      </button>
                  )}

                  {!isCreateMode && !isViewMode && (
                      <button className="btn-save" disabled={isLoading} onClick={handleUpdateMeeting}>
                        {isLoading ? "Saving..." : "Save Changes"}
                      </button>
                  )}

                  {isViewMode && (
                      <button className="btn-save" onClick={() => setIsViewMode(false)}>
                        Switch to Edit
                      </button>
                  )}
                </div>
              </div>
            </div>
        )}

        {/* THÊM: Modal thêm equipment */}
        {showAddEquipmentModal && renderAddEquipmentModal()}

        {/* QR Modal */}
        {showQrModal && (
            <QrModal meetingId={selectedMeetingId} onClose={() => setShowQrModal(false)} />
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
                  <p>Enter email addresses, separated by commas, to invite participants.</p>
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
                            color: inviteMessage.startsWith("Success") ? "green" : "red",
                            fontWeight: "bold",
                            marginBottom: "10px",
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
}

export default MyMeeting;