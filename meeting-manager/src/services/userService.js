// src/services/userService.js
import apiClient from "./apiClient";

// Lấy tất cả user
export const getAllUsers = async () => {
  const res = await apiClient.get("/user/all");
  return res.data;
};
