import axios from "axios";

const apiClient = axios.create({
  baseURL: "http://localhost:8050/api", // đổi theo backend
  headers: {
    "Content-Type": "application/json",
  },
});

// Gắn token vào header nếu có
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

export default apiClient;
