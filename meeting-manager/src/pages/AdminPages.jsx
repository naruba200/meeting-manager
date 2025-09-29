import React, { useState, useEffect  } from 'react';
import { useNavigate } from 'react-router-dom';
import '../assets/styles/AdminPages.css';
import { FaEnvelope, FaUserCircle } from 'react-icons/fa';

const AdminPages = () => {
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [iframeSrc, setIframeSrc] = useState('/users'); // mặc định load UserList

  const menuItems = [
    { label: 'Home', icon: '🏠︎', path: '/home' },
    { label: 'User Management', icon: '☺', path: '/users' },
    { label: 'Meeting Management', icon: '💻', path: '/MeetingRoomList' },
    { label: 'Settings', icon: '⏻', path: '/settings' },
  ];

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
    <div className="admin-container">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="sidebar-header">Views</div>
        <nav className="sidebar-nav">
          {menuItems.map((item, idx) => (
            <div
              key={idx}
              className={`nav-item ${iframeSrc === item.path ? 'active' : ''}`}
              onClick={() => setIframeSrc(item.path)}
            >
              <span className="nav-icon">{item.icon}</span> {item.label}
            </div>
          ))}
        </nav>
      </aside>
        {/* Iframe hiển thị các trang con */}
        <div className="iframe-container">
          <iframe
            title="AdminContent"
            src={iframeSrc}
            className="admin-iframe"
          />
        </div>
    </div>
  );
};

export default AdminPages;
