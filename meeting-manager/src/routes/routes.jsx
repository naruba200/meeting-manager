import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// ===== Auth =====
import LoginPage from "../pages/LoginPage";
import ForgotPassword from "../pages/ForgotPassword";
import ResetPassword from "../pages/ResetPassword";

// ===== Admin Pages =====
import AdminPages from "../pages/Admin/AdminPages";
import UserList from "../pages/Admin/UserList";
import MeetingList from "../pages/Admin/MeetingScheduleList";
import MeetingRoomList from "../pages/Admin/MeetingRoomList";
import PhysicalRoomList from "../pages/Admin/PhysicalRoomList";
import EquipmentList from "../pages/Admin/EquipmentList";
import Report from "../pages/Admin/report";
import TKE from "../pages/Admin/TKE";
import Settings from "../pages/Admin/Settings";

// ===== User Pages =====
import UserMainPages from "../pages/User/UserMainPages";
import UserHome from "../pages/User/UserHome";
import AvailableRoom from "../pages/User/AvailableRooms";
import MyMeeting from "../pages/User/MyMeeting";
import ProfilePage from "../pages/User/UserProfile";
import Notifications from "../pages/User/Notifications";
import ChangePassword from "../pages/User/ChangePassword";
import Equipment from "../pages/User/Equipment";
import Calendar from "../pages/User/Calendar"
import AttendPage from "../pages/User/AttendPage";
import ChatBot from "../pages/User/ChatBot";
//import QrScanner from "../pages/User/QrScanner"; // nếu bạn dùng QrScanner

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 🔹 Mặc định chuyển về login */}
        <Route path="/" element={<Navigate to="/login" />} />

        {/* 🔹 Auth */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        {/* Có thể thêm /register nếu cần */}

        {/* 🔹 Admin */}
        <Route path="/admin" element={<AdminPages />}>
          <Route index element={<Navigate to="users" />} />
          <Route path="users" element={<UserList />} />
          <Route path="MeetingRoomList" element={<MeetingRoomList />} />
          <Route path="MeetingList" element={<MeetingList />} />
          <Route path="PhysicalRoomList" element={<PhysicalRoomList />} />
          <Route path="EquipmentList" element={<EquipmentList />} />
          <Route path="Report" element={<Report />} />
          <Route path="statistics" element={<TKE />} />
          <Route path="settings" element={<Settings />} />
          <Route path="devices" element={<div>Device Management page</div>} />
        </Route>

        {/* 🔹 User */}
        <Route path="/user" element={<UserMainPages />}>
          <Route index element={<UserHome />} />
          <Route path="AvailableRoom" element={<AvailableRoom />} />
          <Route path="mymeeting" element={<MyMeeting />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="password-change" element={<ChangePassword />} />
          <Route path="equipment" element={<Equipment />} />
          <Route path="Calendar" element={<Calendar />} />
          <Route path="attend/:token" element={<AttendPage />} />
          <Route path="chatbot" element={<ChatBot />} />
        </Route>

        {/* <Route path="/qrscanner" element={<QrScanner />} /> */}
        {/* 🔹 Route không tồn tại */}
        {/* <Route path="*" element={<Navigate to="/" />} /> */}
      </Routes>
    </BrowserRouter>
  );
}
