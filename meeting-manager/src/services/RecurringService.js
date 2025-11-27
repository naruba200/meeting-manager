// src/services/RecurringService.js
import apiClient from "./apiClient";

// === XÓA HÀM CŨ ===
// export const createRecurringMeeting = async (payload) => { ... }

// === THÊM HÀM MỚI: makeRecurring ===
export const makeRecurring = async (meetingId, payload, userId) => {
  const res = await apiClient.post(
      `/meetings/${meetingId}/make-recurring?userId=${userId}`,
      payload
  );
  return res.data; // { ids: [...], count: 6, message: "..." }
};

export const fetchRooms = async () => {
  const res = await apiClient.get("/meeting-rooms");
  return Array.isArray(res.data) ? res.data : res.data.content || [];
};