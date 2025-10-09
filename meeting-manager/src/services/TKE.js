
import axios from "axios";

const API_BASE_URL = "http://localhost:8050/api";

// ✅ Hàm lấy báo cáo cuộc họp bị hủy
export const fetchCancelledMeetingsReport = async (startDate, endDate) => {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Token không tồn tại. Vui lòng đăng nhập lại!");
  }

  try {
    const response = await axios.get(`${API_BASE_URL}/reports/cancelled-meetings`, {
      params: { startDate, endDate },
      headers: { Authorization: `Bearer ${token}` },
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
