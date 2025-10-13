import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import "../../assets/styles/Settings.css";
import { ThemeContext } from "../../context/ThemeContext";

const Settings = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useContext(ThemeContext);

  const handleLogout = () => {
    localStorage.removeItem("token");
    if (window.top !== window.self) {
      window.top.location.href = "/login";
    } else {
      navigate("/login");
    }
  };

  return (
    <div className="settings-container">
      <h2 className="settings-title">Cài đặt hệ thống</h2>

      <div className="settings-section">
        <h3>Tài khoản</h3>
        <p>Quản lý tài khoản người dùng, đổi mật khẩu hoặc đăng xuất khỏi hệ thống.</p>
        <button className="logout-btn" onClick={handleLogout}>
          Đăng xuất
        </button>
      </div>

      <div className="settings-section">
        <h3>Giao diện</h3>
        <p>Tuỳ chỉnh chế độ hiển thị sáng hoặc tối.</p>
        <button className="btn-secondary" onClick={toggleTheme}>
          {theme === "light" ? "Bật chế độ tối 🌙" : "Bật chế độ sáng ☀️"}
        </button>
      </div>
    </div>
  );
};

export default Settings;
