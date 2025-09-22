# Big-Hero-8-Meeting_Management-FE
# Quy tắc coding
1. Tên file & thư mục

Component, Page, Layout = PascalCase → UserTable.jsx, LoginPage.jsx, AdminLayout.jsx.

Hooks = useTên → useAuth.js, useFetch.js.

Service = tên entity → userService.js, meetingService.js.
2. Component

Dumb component (chỉ UI) bỏ vào components/.

Smart component (có logic, gọi API, state management) → đặt trong pages/.

Mỗi page chính dùng layout trong layouts/.
3. API services
Trong services/, tạo axios instance riêng:
"// services/api.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080/api", 
  headers: { "Content-Type": "application/json" }
});

export default api;
"
Ví dụ userService.js:
"import api from "./api";

export const getUsers = () => api.get("/users");
export const createUser = (data) => api.post("/users", data);
export const updateUser = (id, data) => api.put(`/users/${id}`, data);
export const deleteUser = (id) => api.delete(`/users/${id}`);
"
4. Routes

Trong routes/AppRoutes.jsx:
"import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "../pages/LoginPage";
import DashboardPage from "../pages/DashboardPage";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
"
Rồi gọi trong App.jsx:
"import AppRoutes from "./routes/AppRoutes";

function App() {
  return <AppRoutes />;
}

export default App;
"
5. Rule chung

Không gọi API trực tiếp trong component → phải qua services/.

Không để state toàn cục lung tung → dùng context/ hoặc redux.

Code format: dùng ESLint + Prettier.

Commit message chuẩn:

feat: add login page

fix: bug in user table