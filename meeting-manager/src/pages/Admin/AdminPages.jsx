import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../assets/styles/AdminPages.css';

const AdminPages = () => {
  const navigate = useNavigate();
  const [iframeSrc, setIframeSrc] = useState('/users'); // mặc định load UserList
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const menuItems = [
    { label: "Home", icon: "🏠", path: "/home" },
    { label: "User Management", icon: "👥", path: "/users" },
    { label: "Meeting Room Management", icon: "🏢", path: "/MeetingRoomList" },
    { label: "Meeting Schedule", icon: "📅", path: "/MeetingList" },
    { label: "Physical Room Management", icon: "🏫", path: "/PhysicalRoomList" },
    { label: "Equipment Management", icon: "🔧", path: "/EquipmentList" },
    { label: "Report", icon: "📋", path: "/Report" },
    { label: "Thống kê", icon: "📊", path: "/statistics" },
    { label: "Settings", icon: "⚙️", path: "/settings" },
    { label: "Logout", icon: "🚪", action: "logout" },
  ];

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
    setShowLogoutConfirm(false);
  };

  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  const handleMenuClick = (item) => {
    if (item.action === "logout") {
      handleLogout();
    } else if (item.path) {
      setIframeSrc(item.path);
    }
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
              className={`nav-item ${iframeSrc === item.path ? 'active' : ''} ${item.action === 'logout' ? 'logout-item' : ''}`}
              onClick={() => handleMenuClick(item)}
            >
              <span className="nav-icon">{item.icon}</span> {item.label}
            </div>
          ))}
        </nav>
      </aside>

      {/* Nội dung chính */}
      <div className="iframe-container">
        <iframe
          title="AdminContent"
          src={iframeSrc}
          className="admin-iframe"
        />
      </div>

      {showLogoutConfirm && (
        <div className="modal-overlay">
          <div className="confirm-dialog">
            <p>Are you sure you want to logout?</p>
            <div className="confirm-actions">
              <button className="secondary-btn" onClick={cancelLogout}>
                Cancel
              </button>
              <button className="danger-btn" onClick={confirmLogout}>
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPages;