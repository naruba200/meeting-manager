import apiClient from "./apiClient";

// 🟢 Lấy lịch họp theo organizerId (userId)
export const getMeetingsByOrganizer = async (organizerId) => {
  try {
    const response = await apiClient.get(`/meetings/organizer/${organizerId}`);
    return response.data;
  } catch (err) {
    throw new Error(err.response?.data?.message || err.message);
  }
};
