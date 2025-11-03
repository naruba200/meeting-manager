// src/services/meetingRoomService.js
import apiClient from "./apiClient";

// Lấy tất cả meeting rooms
export const getAllMeetingRooms = async () => {
  const res = await apiClient.get("/meeting-rooms");
  return res.data;
};

// Lấy meeting room theo ID
export const getMeetingRoomById = async (roomId) => {
  const res = await apiClient.get(`/meeting-rooms/${roomId}`);
  return res.data;
};

// Tạo meeting room mới
export const createMeetingRoom = async (roomData) => {
  const res = await apiClient.post("/meeting-rooms", roomData);
  return res.data;
};

// Cập nhật meeting room theo ID
export const updateMeetingRoom = async (roomId, roomData) => {
  const res = await apiClient.put(`/meeting-rooms/${roomId}`, roomData);
  return res.data;
};

// Xóa meeting room theo ID
export const deleteMeetingRoom = async (roomId) => {
  const res = await apiClient.delete(`/meeting-rooms/${roomId}`);
  return res.data;
};

// Tìm kiếm meeting room theo tên (nếu backend có hỗ trợ query param)
export const searchMeetingRooms = async (name) => {
  const res = await apiClient.get(`/meeting-rooms/search?name=${name}`);
  return res.data;
};
