// src/routes/AppRoutes.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "../pages/LoginPage";
import UserList from "../pages/UserList";
import AdminPages from "../pages/AdminPages";
import MeetingList from "../pages/MeetingScheduleList";
import MeetingRoomList from "../pages/MeetingRoomList";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Mặc định đưa về login */}
        <Route path="/" element={<Navigate to="/login" />} />

        {/* Auth */}
        <Route path="/login" element={<LoginPage />} />

        {/* sau này thêm /register */}

        {/* Admin */}
        <Route path="/admin" element={<AdminPages />} />

        {/* Các trang sẽ hiển thị trong iframe của Admin */}
        <Route path="/users" element={<UserList />} />
        <Route path="/devices" element={<div>Device Management page</div>} />
        <Route path="/settings" element={<div>Settings page</div>} />
        <Route path="/home" element={<div>Home page</div>} />
        <Route path="/MeetingRoomList" element={<MeetingRoomList/>} />
        {/* sau này thêm /register, /dashboard */}

      </Routes>
    </BrowserRouter>
  );
}
