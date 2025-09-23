import axios from "axios";

// Tạo axios client chung
const apiClient = axios.create({
  baseURL: "http://localhost:8050/api", // URL gốc backend
  headers: {
    "Content-Type": "application/json",
  },
});

// Gắn token tự động (nếu có)
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default apiClient;
