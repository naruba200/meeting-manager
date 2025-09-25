// src/services/userService.js
import apiClient from "./apiClient";

// Lấy tất cả user
export const getAllUsers = async () => {
  const res = await apiClient.get("/user/all");
  return res.data;
};

// Lấy user theo ID
export const getUserById = async (userId) => {
  const res = await apiClient.get(`/user/${userId}`);
  return res.data;
};

// Tạo user mới
export const createUser = async (userData) => {
  const res = await apiClient.post("/user/create", userData);
  return res.data;
};

// Cập nhật user theo ID
export const updateUser = async (userId, userData) => {
  const res = await apiClient.put(`/user/${userId}`, userData);
  return res.data;
};

// Xóa user theo ID
export const deleteUser = async (userId) => {
  const res = await apiClient.delete(`/user/${userId}`);
  return res.data;
};

// Tìm kiếm user theo email
export const searchUsers = async (email) => {
  const res = await apiClient.get(`/user/search?email=${email}`);
  return res.data;
};