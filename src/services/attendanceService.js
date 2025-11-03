// src/services/attendanceService.js (hoặc api/attendanceService.js)
import apiClient from "./apiClient";

/**
 * Attendance Service
 * Các hàm dùng để quản lý điểm danh (QR check-in)
 * Gồm: generate QR, scan check-in, lấy danh sách điểm danh
 */

const attendanceService = {
  /**
   * Tạo mã QR cho cuộc họp
   * @param {number} meetingId - ID cuộc họp
   * @returns {Promise<{qrToken: string, qrUrl?: string}>}
   */
  async generateQr(meetingId) {
    try {
      const res = await apiClient.post(`/attendance/generate/${meetingId}`);
      return res.data;
    } catch (error) {
      console.error("Error generating QR:", error);
      throw new Error(error.response?.data?.message || "Lỗi tạo QR");
    }
  },

  /**
   * Quét mã QR để điểm danh
   * @param {string} token - Mã QR token
   * @returns {Promise<{message: string, total: number, attendees?: string[]}>}
   */
  async scan(token) {
    try {
      const res = await apiClient.post(`/attendance/scan?token=${token}`);
      return res.data;
    } catch (error) {
      console.error("Error scanning QR:", error);
      throw new Error(error.response?.data?.message || "Lỗi check-in");
    }
  },

  /**
   * Lấy danh sách người đã điểm danh trong một cuộc họp
   * @param {number} meetingId - ID cuộc họp
   * @returns {Promise<Array>} - Danh sách attendance
   */
  async getAttendanceList(meetingId) {
    try {
      const res = await apiClient.get(`/attendance/list/${meetingId}`);
      return res.data;
    } catch (error) {
      console.error("Error fetching attendance list:", error);
      return [];
    }
  },
};

export default attendanceService;