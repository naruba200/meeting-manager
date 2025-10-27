import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../../assets/styles/UserCSS/UserMainPages.css";
import { 
  FaUserCircle, 
  FaBullseye, 
  FaClipboardList, 
  FaHome, 
  FaTimes, 
  FaCalendarAlt,
  FaTv
} from "react-icons/fa";

const UserMainPages = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeSection, setActiveSection] = useState("home");
  const [iframeUrl, setIframeUrl] = useState("");
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, message: "New meeting scheduled for tomorrow" }
  ]);
  const [showPopup, setShowPopup] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token || !userData) {
      navigate("/login");
    } else {
      setUser(JSON.parse(userData));
      setIframeUrl("/dashboard");
    }

    // Simulate new notification popup
    if (notifications.length > 0) {
      setShowPopup(true);
      const timer = setTimeout(() => {
        setShowPopup(false);
      }, 5000); // Popup disappears after 5 seconds
      return () => clearTimeout(timer);
    }
  }, [navigate, notifications]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const handleNavigation = (section, url) => {
    setActiveSection(section);
    setIframeUrl(url);
    setDropdownOpen(false);
  };

  const closeIframe = () => {
    setActiveSection("home");
    setIframeUrl("");
  };

  const closePopup = () => {
    setShowPopup(false);
  };

  return (
    <div className="user-main-container">
      <header className="navbar">
        <div className="navbar-left">
          <span className="brand">Meeting Scheduling Website</span>
        </div>
        <nav className="navbar-center">
          <a 
            href="#home" 
            className={activeSection === "home" ? "active" : ""}
            onClick={(e) => {
              e.preventDefault();
              handleNavigation("home", "/dashboard");
            }}
          >
            <FaHome style={{ marginRight: "5px" }} />
            Home
          </a>
          <a 
            href="#mymeeting" 
            className={activeSection === "mymeeting" ? "active" : ""}
            onClick={(e) => {
              e.preventDefault();
              handleNavigation("mymeeting", "/mymeeting");
            }}
          >
            <FaCalendarAlt style={{ marginRight: "5px" }} />
            My Meetings
          </a>
          <a 
            href="#AvailableRoom" 
            className={activeSection === "AvailableRoom" ? "active" : ""}
            onClick={(e) => {
              e.preventDefault();
              handleNavigation("AvailableRoom", "/AvailableRoom");
            }}
          >
            <FaBullseye style={{ marginRight: "5px" }} />
            AvailableRoom
          </a>
          <a 
            href="#equipment" 
            className={activeSection === "equipment" ? "active" : ""}
            onClick={(e) => {
              e.preventDefault();
              handleNavigation("equipment", "/equipment");
            }}
          >
            <FaTv style={{ marginRight: "5px" }} />
            Equipment
          </a>
        </nav>
        <div className="navbar-right">
          <div className="dropdown" ref={dropdownRef}>
            <button className="dropbtn" onClick={() => setDropdownOpen(!isDropdownOpen)}>
              <FaUserCircle size={22} style={{ marginRight: "5px" }} />
              {user?.username || "User"}
              <span className={`notification-dot ${notifications.length === 0 ? 'hidden' : ''}`}></span>
            </button>
            <div className={`dropdown-content ${isDropdownOpen ? 'open' : ''}`}>
              <a 
                href="#profile"
                onClick={(e) => {
                  e.preventDefault();
                  handleNavigation("profile", "/profile");
                }}
              >
                Profile
              </a>
              <a 
                href="#notifications"
                onClick={(e) => {
                  e.preventDefault();
                  handleNavigation("notifications", "/notifications");
                }}
                style={{ position: "relative" }}
              >
                Notifications
                <span className={`notification-dot ${notifications.length === 0 ? 'hidden' : ''}`} style={{ top: "12px", right: "12px" }}></span>
              </a>
              <a onClick={logout}>Logout</a>
            </div>
          </div>
        </div>
      </header>

      {showPopup && notifications.length > 0 && (
        <div
          style={{
            position: "fixed",
            top: "20px",
            right: "20px",
            background: "#f8fafc",
            borderRadius: "12px",
            padding: "16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px",
            boxShadow: "0 4px 12px rgba(30, 58, 138, 0.2)",
            zIndex: 2000,
            maxWidth: "300px",
            animation: "slideIn 0.5s ease-out, slideOut 0.5s ease-in 4.5s",
          }}
        >
          <p style={{ margin: 0, color: "#1e293b", fontSize: "14px", fontWeight: 600 }}>
            {notifications[0].message}
          </p>
          <button
            onClick={closePopup}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#1e3a8a",
              fontSize: "16px",
              padding: "8px",
              borderRadius: "8px",
              transition: "all 0.3s ease"
            }}
            onMouseOver={(e) => e.currentTarget.style.background = "rgba(30, 58, 138, 0.1)"}
            onMouseOut={(e) => e.currentTarget.style.background = "none"}
          >
            <FaTimes />
          </button>
          <style>
            {`
              @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
              }
              @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
              }
            `}
          </style>
        </div>
      )}

      <div className="main-content">
        {activeSection === "home" ? (
          <>
            <section className="hero">
              <div className="hero-overlay">
                <h1>Welcome back, {user?.username || "User"} 👋</h1>
                <p>Track your meeting cylinder with modern insights</p>
                {/* <div className="hero-buttons">
                  <button 
                    className="btn-primary"
                    onClick={() => handleNavigation("dashboard", "/dashboard")}
                  >
                    View Dashboard
                  </button>
                  <button 
                    className="btn-secondary"
                    onClick={() => handleNavigation("logs", "/logs")}
                  >
                    Add New Log
                  </button>
                </div> */}
              </div>
            </section>

            <section className="metrics-section">
              <div className="metrics-grid">
                <div 
                  className="metric-card"
                  onClick={() => handleNavigation("mymeeting", "/mymeeting")}
                >
                  <FaCalendarAlt size={40} className="icon" />
                  <h3>My Meetings</h3>
                  <p>View and manage your scheduled meetings</p>
                </div>
                <div 
                  className="metric-card"
                  onClick={() => handleNavigation("AvailableRoom", "/AvailableRoom")}
                >
                  <FaClipboardList size={40} className="icon" />
                  <h3>My AvailableRoom</h3>
                  <p>Track available room for meeting</p>
                </div>
                <div 
                  className="metric-card"
                  onClick={() => handleNavigation("logs", "/logs")}
                >
                  <FaBullseye size={40} className="icon" />
                  <h3>Daily Logs</h3>
                  <p></p>
                </div>
                <div 
                  className="metric-card"
                  onClick={() => handleNavigation("notifications", "/notifications")}
                >
                  <FaBullseye size={40} className="icon" />
                  <h3>Notifications</h3>
                  <p>View all your notifications</p>
                </div>
                               <div 
                  className="metric-card"
                  onClick={() => handleNavigation("equipment", "/equipment")}
                >
                  <FaTv size={40} className="icon" />
                  <h3>Equipment</h3>
                  <p>View available meeting equipment</p>
                </div>
              </div>
            </section>
          </>
        ) : (
          <div className="iframe-container">
            <div className="iframe-header">
              <h3>{activeSection.charAt(0).toUpperCase() + activeSection.slice(1)}</h3>
              <button className="close-iframe" onClick={closeIframe}>
                <FaTimes />
              </button>
            </div>
            <iframe
              src={iframeUrl}
              title={activeSection}
              className="content-iframe"
              loading="lazy"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default UserMainPages;