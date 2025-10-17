import axios from "axios";

const apiClient = axios.create({
  baseURL: "http://localhost:8050/api", // đổi theo backend của bạn
  headers: {
    "Content-Type": "application/json",
  },
});

// 🧩 1. Gắn token vào header nếu có
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    const tokenType = localStorage.getItem("tokenType") || "Bearer";

    if (token) {
      config.headers.Authorization = `${tokenType} ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 🧩 2. (Khuyến nghị) Tự động xử lý khi token hết hạn (401 Unauthorized)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Xóa token cũ
      localStorage.removeItem("token");
      localStorage.removeItem("tokenType");
      localStorage.removeItem("user");

      // Chuyển về trang đăng nhập
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default apiClient;
