// src/services/userService.js
import apiClient from "./apiClient";

/**
 * Lấy tất cả người dùng có phân trang
 * @param {number} page - Trang hiện tại (bắt đầu từ 0)
 * @param {number} size - Số lượng phần tử mỗi trang
 */
export const getAllUsers = async (page = 0, size = 10) => {
  const res = await apiClient.get("/user/all", {
    params: { page, size },
  });
  return res.data; // Trả về dữ liệu từ Spring Boot (Page<User>)
};

/**
 * Lấy thông tin người dùng theo ID
 * @param {string|number} userId - ID của người dùng
 */
export const getUserById = async (userId) => {
  const res = await apiClient.get(`/user/${userId}`);
  return res.data;
};

/**
 * Tạo người dùng mới
 * @param {object} userData - Dữ liệu người dùng cần tạo
 */
export const createUser = async (userData) => {
  const res = await apiClient.post("/user/create", userData);
  return res.data;
};

/**
 * Cập nhật thông tin người dùng theo ID
 * @param {string|number} userId - ID của người dùng
 * @param {object} userData - Dữ liệu cập nhật
 */
export const updateUser = async (userId, userData) => {
  const res = await apiClient.put(`/user/${userId}`, userData);
  return res.data;
};

/**
 * Xóa người dùng theo ID
 * @param {string|number} userId - ID người dùng
 */
export const deleteUser = async (userId) => {
  const res = await apiClient.delete(`/user/${userId}`);
  return res.data;
};

/**
 * Tìm kiếm người dùng theo email
 * @param {string} email - Email cần tìm
 */
export const searchUsers = async (email) => {
  const res = await apiClient.get(`/user/search`, {
    params: { email },
  });
  return res.data;
};

/**
 * Đổi mật khẩu người dùng
 * @param {object} passwordData - Dữ liệu mật khẩu mới
 * @param {string} passwordData.oldPassword - Mật khẩu cũ
 * @param {string} passwordData.newPassword - Mật khẩu mới
 */
export const changePassword = async (passwordData) => {
  const res = await apiClient.post("/user/change-password", passwordData);
  return res.data;
};
