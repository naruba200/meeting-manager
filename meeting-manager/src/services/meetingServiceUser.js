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