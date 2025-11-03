import React, { useState, useEffect } from 'react';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import '../../assets/styles/AdminPages.css';

const AdminPages = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const menuItems = [
    { label: "User Management", icon: "👥", path: "users" },
    { label: "Meeting Room Management", icon: "🏢", path: "MeetingRoomList" },
    { label: "Meeting Schedule", icon: "📅", path: "MeetingList" },
    { label: "Physical Room Management", icon: "🏫", path: "PhysicalRoomList" },
    { label: "Equipment Management", icon: "🖥️", path: "EquipmentList" },
    { label: "Reports", icon: "📑", path: "Report" },
    { label: "Statistics", icon: "📊", path: "statistics" },
    { label: "Settings", icon: "⚙️", path: "settings" },
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
      navigate(item.path);
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
              className={`nav-item ${location.pathname.endsWith(item.path) ? 'active' : ''} ${item.action === 'logout' ? 'logout-item' : ''}`}
              onClick={() => handleMenuClick(item)}
            >
              <span className="nav-icon">{item.icon}</span> {item.label}
            </div>
          ))}
        </nav>
      </aside>

      {/* Nội dung chính */}
      <div className="iframe-container">
        <Outlet />
      </div>

      {showLogoutConfirm && (
        <div className="modal-overlay">
          <div className="confirm-dialog">
            <p>Are you sure you want to logout?</p>
            <div className="confirm-actions">
              <button className="btn-secondary" onClick={cancelLogout}>
                Cancel
              </button>
              <button className="btn-danger" onClick={confirmLogout}>
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