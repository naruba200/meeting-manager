import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../assets/styles/MeetingRoomList.css";

const Layout = ({ children }) => {
  const [isMainSidebarOpen, setIsMainSidebarOpen] = useState(true);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();

  // Check login
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  // Đóng user menu khi click ra ngoài
  useEffect(() => {
    const closeMenu = (e) => {
      if (!e.target.closest(".user-menu-wrapper")) setShowUserMenu(false);
    };
    document.addEventListener("click", closeMenu);
    return () => document.removeEventListener("click", closeMenu);
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="app-container">
      {/* Navbar */}
      <nav className="top-navbar">
        <span className="nav-icon">✉︎</span>
        <div className="user-menu-wrapper" style={{ position: "relative" }}>
          <span
            className="nav-icon"
            style={{ cursor: "pointer" }}
            onClick={() => setShowUserMenu((prev) => !prev)}
          >
            🜲
          </span>
          {showUserMenu && (
            <div className="user-menu">
              <div className="user-menu-item">Thông tin tài khoản</div>
              <div className="user-menu-item" onClick={logout}>
                Đăng xuất
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Sidebar */}
      <aside className={`main-sidebar ${isMainSidebarOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <span>Views</span>
          <span
            className="menu-toggle"
            onClick={() => setIsMainSidebarOpen(!isMainSidebarOpen)}
          >
            ≡
          </span>
        </div>
        <nav className="sidebar-nav">
          <div className="nav-item"><span className="nav-icon">🏠︎</span> Home</div>
          <div className="nav-item" onClick={() => navigate("/UserList")}>
            <span className="nav-icon">☺</span> User Management
          </div>
         <div className="nav-item" onClick={() => navigate("/MeetingRoomList")}><span className="nav-icon">📅</span> Meeting</div>
          <div className="nav-item"><span className="nav-icon">⏻</span> Settings</div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className={`main-content ${!isMainSidebarOpen ? "full" : ""}`}>
        {children}
      </main>
    </div>
  );
};

export default Layout;
