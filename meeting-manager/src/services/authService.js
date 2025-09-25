import apiClient from "./apiClient";

// Gọi API login
export const login = async (email, password) => {
  try {
    const res = await apiClient.post("/auth/login", { email, password });

    // Nếu backend trả về token thì lưu lại
    if (res.data.accessToken) {
      localStorage.setItem("token", res.data.accessToken);
      localStorage.setItem("tokenType", res.data.tokenType || "Bearer");
      localStorage.setItem("user", JSON.stringify(res.data.user));
    }

    return res.data; // trả về dữ liệu cho LoginPage xử lý
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
};

// Lấy thông tin user hiện tại
export const getProfile = async () => {
  const res = await apiClient.get("/auth/profile");
  return res.data;
};

// Đăng xuất
export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("tokenType");
  localStorage.removeItem("user");
};
