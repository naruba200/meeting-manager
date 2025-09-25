import apiClient from "./apiClient";

// Gọi API login
export const login = async (email, password) => {
  try {
    const res = await apiClient.post("/auth/login", {
      email,
      password,
    });

    // Nếu backend trả về token thì lưu lại
    if (res.data.token) {
      localStorage.setItem("token", res.data.token);
    }

    return res.data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
};


export const getProfile = async () => {
  const res = await apiClient.get("/auth/profile");
  return res.data;
};
