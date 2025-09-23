import axios from "axios";

const API_URL = "http://localhost:8080/api/auth"; // backend Spring Boot

export async function login(username, password) {
  const res = await axios.post(`${API_URL}/login`, { username, password });
  localStorage.setItem("token", res.data.token); // lưu JWT
  return res.data;
}
//tạm test