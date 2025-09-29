import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../assets/styles/AdminPages.css';

const AdminPages = () => {
  const navigate = useNavigate();
  const [iframeSrc, setIframeSrc] = useState('/users'); // mặc định load UserList

  const menuItems = [
    { label: 'Home', icon: '🏠︎', path: '/home' },
    { label: 'User Management', icon: '☺', path: '/users' },
    { label: 'Device Management', icon: '💻', path: '/devices' },
    { label: 'Settings', icon: '⏻', path: '/settings' },
  ];

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

      {/* Nội dung */}
      <main className="admin-main">
        <nav className="top-navbar">
          <span className="nav-icon">✉︎</span>
          <div className="user-menu">🜲</div>
        </nav>

        {/* Iframe hiển thị các trang con */}
        <div className="iframe-container">
          <iframe
            title="AdminContent"
            src={iframeSrc}
            className="admin-iframe"
          />
        </div>
      </main>
    </div>
  );
};

export default AdminPages;
