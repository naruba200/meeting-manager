
import apiClient from "./apiClient";

// 1. Khởi tạo Meeting
export const initMeeting = async (meetingData) => {
  const res = await apiClient.post("/meetings/init", meetingData);
  return res.data; // { meetingId, message }
};

// 2. Tạo Meeting Room
export const createMeetingRoom = async (meetingRoomData) => {
  const res = await apiClient.post("/meeting-rooms/create", meetingRoomData);
  return res.data; // { roomId, type, message }
};

// 3. Lọc phòng vật lý khả dụng
export const filterPhysicalRooms = async (filterData) => {
  const res = await apiClient.post("/physical-rooms/filter-and-assign", filterData);
  return res.data; // [{ physicalId, location, capacity }]
};

// 4. Gán phòng vật lý
export const assignPhysicalRoom = async (assignData) => {
  const res = await apiClient.post("/physical-rooms/assign", assignData);
  return res.data; // { message: "Physical room assigned successfully" }
};
