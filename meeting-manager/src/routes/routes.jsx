// src/routes/AppRoutes.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "../pages/LoginPage";

import UserList from "../pages/Admin/UserList";
import AdminPages from "../pages/Admin/AdminPages";
import MeetingList from "../pages/Admin/MeetingScheduleList";
import MeetingRoomList from "../pages/Admin/MeetingRoomList";
import PhysicalRoomList from "../pages/Admin/PhysicalRoomList";
import EquipmentList from "../pages/Admin/EquipmentList";
import UserMainPages from "../pages/User/UserMainPages";
import Report from "../pages/Admin/report"; 
import TKE from "../pages/TKE";



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
        {/* User */}
        <Route path="/user" element={<UserMainPages />} />
        {/* Các trang sẽ hiển thị trong iframe của Admin */}
        <Route path="/users" element={<UserList />} />
        <Route path="/devices" element={<div>Device Management page</div>} />
        <Route path="/settings" element={<div>Settings page</div>} />
        <Route path="/home" element={<div>Home page</div>} />
        <Route path="/MeetingRoomList" element={<MeetingRoomList/>} />
        <Route path="/MeetingList" element={<MeetingList/>} />
        <Route path="/PhysicalRoomList" element={<PhysicalRoomList/>} />
        <Route path="statistics" element={<TKE />} /> 
        <Route path="/EquipmentList" element={<EquipmentList/>} />
        <Route path="/Report" element={<Report />} /> 
        {/* sau này thêm /register, /dashboard */}
        
        
      </Routes>
    </BrowserRouter>
  );
}
