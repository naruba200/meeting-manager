import axios from "axios";

const API_BASE_URL = "https://meeting-be-1-0.onrender.com/api/notifications";

export const getUserNotifications = async (userId, token) => {
  const res = await axios.get(`${API_BASE_URL}/${userId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const createNotification = async (notification, token) => {
  const res = await axios.post(API_BASE_URL, notification, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const markAsRead = async (id, token) => {
  await axios.put(`${API_BASE_URL}/${id}/read`, null, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const deleteNotification = async (id, token) => {
  await axios.delete(`${API_BASE_URL}/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};
