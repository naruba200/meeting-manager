import apiClient from "./apiClient";

export const getUserNotifications = async (userId) => {
  const res = await apiClient.get(`/notifications/${userId}`);
  return res.data;
};

export const createNotification = async (notification) => {
  const res = await apiClient.post("/notifications", notification);
  return res.data;
};

export const markAsRead = async (id) => {
  await apiClient.put(`/notifications/${id}/read`, null);
};

export const deleteNotification = async (id) => {
  await apiClient.delete(`/notifications/${id}`);
};
