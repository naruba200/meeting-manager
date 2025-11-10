
import apiClient from './apiClient';

// ✅ Hàm lấy báo cáo cuộc họp bị hủy
export const fetchCancelledMeetingsReport = async (startDate, endDate) => {
  try {
    const response = await apiClient.get('/reports/cancelled-meetings', {
      params: { startDate, endDate },
    });
    return response.data;
  } catch (err) {
    // Ném lỗi cụ thể để component xử lý
    if (err.response) {
      throw {
        status: err.response.status,
        message:
          err.response.data?.message ||
          `Lỗi ${err.response.status}: ${err.response.statusText}`,
      };
    } else {
      throw { status: 0, message: "Không thể kết nối tới máy chủ API." };
    }
  }
};
