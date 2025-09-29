
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "../pages/LoginPage";
import UserList from "../pages/UserList";
import MeetingList from "../pages/MeetingScheduleList";
import MeetingRoomList from "../pages/MeetingRoomList";
export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/UserList" element={<UserList />} />
        <Route path="/MeetingRoomList" element={<MeetingRoomList/>} />
        {/* sau này thêm /register, /dashboard */}
      </Routes>
    </BrowserRouter>
  );
}

