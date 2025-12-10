import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Auth
import LoginPage from "../pages/LoginPage";
import ForgotPassword from "../pages/ForgotPassword";
import ResetPassword from "../pages/ResetPassword";

// Admin (giữ iframe nếu bạn vẫn muốn)
import AdminPages from "../pages/Admin/AdminPages";
import UserList from "../pages/Admin/UserList";
import MeetingList from "../pages/Admin/MeetingScheduleList";
import MeetingRoomList from "../pages/Admin/MeetingRoomList";
import PhysicalRoomList from "../pages/Admin/PhysicalRoomList";
import EquipmentList from "../pages/Admin/EquipmentList";
import Report from "../pages/Admin/report";
import TKE from "../pages/Admin/TKE";
import Settings from "../pages/Admin/Settings";



// User
import UserMainPages from "../pages/User/UserMainPages"; // Giữ nguyên
import AvailableRoom from "../pages/User/AvailableRooms";
import MyMeeting from "../pages/User/MyMeeting";
import History from "../pages/User/History";
import ProfilePage from "../pages/User/UserProfile";
import Notifications from "../pages/User/Notifications";
import ChangePassword from "../pages/User/ChangePassword";
import Equipment from "../pages/User/Equipment";
import Calendar from "../pages/User/Calendar";
import AttendPage from "../pages/User/AttendPage";
import InvitedMeetings from "../pages/User/InvitedMeetings"; // ĐÃ THÊM
//import QrScanner from "../pages/User/QrScanner"; // nếu bạn dùng QrScanner
export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />

        {/* Auth */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Admin - vẫn dùng iframe (giữ nguyên) */}
        <Route path="/admin" element={<AdminPages />} />
        <Route path="/users" element={<UserList />} />
        <Route path="/MeetingRoomList" element={<MeetingRoomList />} />
        <Route path="/MeetingList" element={<MeetingList />} />
        <Route path="/PhysicalRoomList" element={<PhysicalRoomList />} />
        <Route path="/EquipmentList" element={<EquipmentList />} />
        <Route path="/Report" element={<Report />} />
        <Route path="/statistics" element={<TKE />} />
        <Route path="/settings" element={<Settings />} />

        {/* User - Dùng nested routes, render trực tiếp */}
        <Route path="/user" element={<UserMainPages />}>
          <Route path="mymeeting" element={<MyMeeting />} />
          <Route path="history" element={<History />} />
          <Route path="available-rooms" element={<AvailableRoom />} />
          <Route path="equipment" element={<Equipment />} />
          <Route path="calendar" element={<Calendar />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="invited-meetings" element={<InvitedMeetings />} /> {/* ĐÃ THÊM */}
        </Route>
        <Route path="attend/:token" element={<AttendPage />} />
        <Route path="password-change" element={<ChangePassword />} />
        {/* <Route path="/qrscanner" element={<QrScanner />} /> */}
        {/* 🔹 Route không tồn tại */}
        {/* <Route path="*" element={<Navigate to="/" />} /> */}
      </Routes>
    </BrowserRouter>
  );
}