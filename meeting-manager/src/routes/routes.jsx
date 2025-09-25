
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "../pages/LoginPage";
import UserList from "../pages/UserList";
export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<UserList />} />
        <Route path="/user-list" element={<UserList />} />
        {/* sau này thêm /register, /dashboard */}
      </Routes>
    </BrowserRouter>
  );
}

