// src/services/meetingService.js
import apiClient from "./apiClient";

// Lấy tất cả meetings
export const getAllMeetings = async () => {
  const res = await apiClient.get("/meetings");
  return res.data;
};

// Lấy tất cả meetings-rooms
export const getAllMeetingRooms = async () => {
  const res = await apiClient.get("/meeting-rooms");
  return res.data;
};

// Lấy meeting theo ID
export const getMeetingById = async (id) => {
  const res = await apiClient.get(`/meetings/${id}`);
  return res.data;
};

// Tạo meeting mới
export const createMeeting = async (meetingData) => {
  const res = await apiClient.post("/meetings", meetingData);
  return res.data;
};

// Cập nhật meeting theo ID
export const updateMeeting = async (id, meetingData) => {
  const res = await apiClient.put(`/meetings/${id}`, meetingData);
  return res.data;
};

// Xóa meeting
export const deleteMeeting = async (id) => {
  const res = await apiClient.delete(`/meetings/${id}`);
  return res.data;
};
