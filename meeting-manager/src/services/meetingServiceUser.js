import apiClient from "./apiClient";

// 🟢 1. Lấy danh sách meeting theo organizerId (chính là userId của user đang đăng nhập)
export const getMeetingsByOrganizer = async (organizerId) => {
  const res = await apiClient.get(`/meetings/organizer/${organizerId}`);
  return res.data; // Mảng meeting
};

// 🟢 2. Khởi tạo Meeting
export const initMeeting = async (meetingData) => {
  const res = await apiClient.post("/meetings/init", meetingData);
  return res.data; // { meetingId, message }
};

// 🟢 3. Tạo Meeting Room
export const createMeetingRoom = async (meetingRoomData) => {
  const res = await apiClient.post("/meeting-rooms/create", meetingRoomData);
  return res.data; // { roomId, type, message }
};

// 🟢 4. Lọc phòng vật lý khả dụng
export const filterPhysicalRooms = async (filterData) => {
  const res = await apiClient.post("/physical-rooms/filter-and-assign", filterData);
  return res.data; // [{ physicalId, location, capacity }]
};

// 🟢 5. Gán phòng vật lý
export const assignPhysicalRoom = async (assignData) => {
  const res = await apiClient.post("/physical-rooms/assign", assignData);
  return res.data; // { message: "Physical room assigned successfully" }
};

// 🟢 6. Cập nhật Meeting (cho edit)
export const updateMeeting = async (meetingId, meetingData) => {
  const res = await apiClient.put(`/meetings/${meetingId}`, meetingData);
  return res.data; // Meeting object đã update
};

// 🟢 7. Hủy (Xóa) Meeting - Sử dụng endpoint cancel với reason
export const cancelMeeting = async (meetingId, reason = "User cancelled the meeting") => {
  const res = await apiClient.post(`/meetings/${meetingId}/cancel`, { reason });
  return res.data; // { message: "Meeting cancelled successfully" }
};

export const getPhysicalRoomById = async (physicalId) => {
  try {
    const response = await apiClient.get(`/physical-rooms/${physicalId}`);
    return response.data;
  } catch (error) {
    throw new Error("Lỗi khi lấy thông tin phòng vật lý");
  }
};

export const updateMeetingRoom = async (roomId, data) => {
  try {
    const response = await apiClient.put(`/meeting-rooms/${roomId}`, data);
    console.log("API updateMeetingRoom response:", response.data);
    return response.data;
  } catch (error) {
    throw new Error("Lỗi khi cập nhật phòng họp");
  }
};

// 🟢 8. Lấy danh sách thiết bị khả dụng cho khung giờ (step 4) - Fix duplicate /api
export const getAvailableEquipment = async (filterData) => {
  try {
    const response = await apiClient.get("/equipment/available", {  // Xóa "/api" để tránh duplicate
      params: filterData,  // { roomId, startTime, endTime }
    });
    return response.data;  // Mảng equipment available
  } catch (error) {
    const errorMsg = error.response?.data?.error || error.message;
    throw new Error(`Lỗi khi lấy danh sách thiết bị khả dụng: ${errorMsg}`);
  }
};

// 🟢 9. Đặt mượn thiết bị (book equipment cho từng item trong step 4) - Error handling cải thiện
export const bookEquipment = async (bookingData) => {
  try {
    const response = await apiClient.post("/equipment/book", bookingData);  // { equipmentId, roomId, startTime, endTime, userId, quantity }
    return response.data;  // { message, bookingId, newStatus, ... }
  } catch (error) {
    const errorMsg = error.response?.data?.error || error.message;
    throw new Error(`Lỗi khi đặt mượn thiết bị: ${errorMsg}`);
  }
};

// 🟢 10. THÊM MỚI: Lấy danh sách booking thiết bị theo userId (lịch sử mượn của user, hỗ trợ phân trang)
export const getBookingsByUser = async (userId, page = 0, size = 10) => {
  try {
    const response = await apiClient.get(`/equipment/bookings/user/${userId}`, {
      params: { page, size },
    });
    return response.data;  // List<Map> với chi tiết: bookingId, equipmentName, roomName, startTime, endTime, userName, quantity, equipmentStatus
  } catch (error) {
    const errorMsg = error.response?.data?.error || error.message;
    throw new Error(`Lỗi khi lấy lịch sử booking: ${errorMsg}`);
  }
};

// 🟢 11. THÊM MỚI: Lấy chi tiết một booking theo bookingId
export const getBookingDetails = async (bookingId) => {
  try {
    const response = await apiClient.get(`/equipment/bookings/${bookingId}`);
    return response.data;  // Map với chi tiết đầy đủ: bookingId, equipmentName, roomName, startTime, endTime, userName, quantity, equipmentStatus
  } catch (error) {
    const errorMsg = error.response?.data?.error || error.message;
    throw new Error(`Lỗi khi lấy chi tiết booking: ${errorMsg}`);
  }
};

// 🟢 12. THÊM MỚI: Hủy một booking thiết bị theo bookingId
export const cancelBooking = async (bookingId) => {
  try {
    const response = await apiClient.delete(`/equipment/book/${bookingId}`);
    return response.data;  // { message: "Hủy booking thành công" }
  } catch (error) {
    const errorMsg = error.response?.data?.error || error.message;
    throw new Error(`Lỗi khi hủy booking: ${errorMsg}`);
  }
};

// 🟢 13. Cập nhật số lượng booking thiết bị
export const updateBookingQuantity = async (bookingId, quantity) => {
  try {
    const response = await apiClient.put(`/equipment/book/${bookingId}/quantity`, { quantity });
    return response.data;
  } catch (error) {
    const errorMsg = error.response?.data?.error || error.message;
    throw new Error(`Lỗi khi cập nhật số lượng thiết bị: ${errorMsg}`);
  }
};

// 🟢 14. Mời người dùng vào cuộc họp
export const inviteToMeeting = async (meetingId, emails) => {
  try {
    console.log(`[inviteToMeeting] Sending invite for meetingId: ${meetingId} with emails:`, emails);
    const response = await apiClient.post(`/meetings/${meetingId}/invite`, { inviteeEmails: emails });
    console.log("[inviteToMeeting] API response:", response.data);
    return response.data;
  } catch (error) {
    console.error("[inviteToMeeting] API error:", error);
    const errorMsg = error.response?.data?.message || error.message;
    throw new Error(`Lỗi khi mời người dùng vào cuộc họp: ${errorMsg}`);
  }
};

// 🟢 15. Lấy danh sách người tham gia cuộc họp
export const getMeetingParticipants = async (meetingId) => {
  try {
    const response = await apiClient.get(`/meetings/${meetingId}/participants`);
    return response.data;
  } catch (error) {
    const errorMsg = error.response?.data?.message || error.message;
    throw new Error(`Lỗi khi lấy danh sách người tham gia: ${errorMsg}`);
  }
};

// 🟢 16. Xóa người tham gia khỏi cuộc họp
export const removeParticipant = async (meetingId, email) => {
  try {
    const response = await apiClient.delete(`/meetings/${meetingId}/participants/${email}`);
    return response.data;
  } catch (error) {
    const errorMsg = error.response?.data?.message || error.message;
    throw new Error(`Lỗi khi xóa người tham gia: ${errorMsg}`);
  }
};


export const filterMeetingsByDate = async (startDate, endDate) => {
  try {
    const response = await apiClient.get(`meetings/filter-by-date`, {
      params: { startDate, endDate },
    });
    return response.data;
  } catch (error) {
    console.error("Error filtering meetings:", error);
    throw error;
  }
};