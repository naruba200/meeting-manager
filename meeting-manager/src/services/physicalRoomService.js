// src/services/physicalRoomService.js
import apiClient from "./apiClient";

// Lấy tất cả phòng vật lý
export const getAllPhysicalRooms = async () => {
  const res = await apiClient.get("/physical-rooms");
  return res.data;
};

// Lấy phòng theo ID
export const getPhysicalRoomById = async (id) => {
  const res = await apiClient.get(`/physical-rooms/${id}`);
  return res.data;
};

// Tạo phòng mới
export const createPhysicalRoom = async (roomData) => {
  const res = await apiClient.post("/physical-rooms", roomData);
  return res.data;
};

// Cập nhật phòng theo ID
export const updatePhysicalRoom = async (id, roomData) => {
  const res = await apiClient.put(`/physical-rooms/${id}`, roomData);
  return res.data;
};

// Xóa phòng theo ID
export const deletePhysicalRoom = async (id) => {
  const res = await apiClient.delete(`/physical-rooms/${id}`);
  return res.data;
};

// B1. Lọc phòng trống vật lý
export const filterAvailablePhysicalRooms = async (startTime, endTime, capacity) => {
  const body = {
    capacity: Number(capacity) || 0,
    startTime: startTime ? startTime.replace("Z", "") : null, // bỏ 'Z' nếu có
    endTime: endTime ? endTime.replace("Z", "") : null,
  };

  console.log("📤 Sending to backend:", body);

  const res = await apiClient.post("/physical-rooms/filter-available", body);
  return res.data;
};
// B2. Tạo phòng họp từ phòng vật lý
export const createMeetingRoomFromPhysical = async (roomName, physicalId) => {
  const body = { roomName, physicalId };
  const res = await apiClient.post("/meeting-rooms/create-from-physical", body);
  return res.data;
};
// B3. Tạo meeting trong phòng họp
export const createMeetingWithRoom = async (title, description, roomId) => {
  const body = { title, description, roomId };
  const res = await apiClient.post("/meetings/create-with-room", body);
  return res.data;
};