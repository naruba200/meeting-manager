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

// 🟢 6. Xóa Meeting
export const deleteMeeting = async (Id) => {
  const res = await apiClient.delete(`/meetings/${Id}`);
  return res.data;
};

// 🟢 Cập nhật meeting
export const updateMeeting = async (Id, meetingData) => {
  const res = await apiClient.put(`/meetings/${Id}`, meetingData);
  return res.data;
};