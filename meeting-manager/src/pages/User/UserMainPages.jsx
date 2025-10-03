import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../assets/styles/UserCSS/UserMainPages.css";
import { 
  FaUserCircle, 
  FaBullseye, 
  FaClipboardList, 
  FaHome, 
  FaTimes, 
  FaCalendarAlt   // 👈 icon lịch cho My Meetings
} from "react-icons/fa";

const UserMainPages = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeSection, setActiveSection] = useState("home");
  const [iframeUrl, setIframeUrl] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token || !userData) {
      navigate("/login");
    } else {
      setUser(JSON.parse(userData));
      setIframeUrl("/dashboard"); // URL mặc định khi load
    }
  }, [navigate]);

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const handleNavigation = (section, url) => {
    setActiveSection(section);
    setIframeUrl(url);
  };

  const closeIframe = () => {
    setActiveSection("home");
    setIframeUrl("");
  };

  return (
    <div className="user-main-container">
      {/* ===== NAVBAR ===== */}
      <header className="navbar">
        <div className="navbar-left">
          <span className="brand">Healthcare Tracker</span>
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
            <FaCalendarAlt style={{ marginRight: "5px" }} /> {/* 👈 icon lịch */}
            My Meetings
          </a>
          <a 
            href="#targets" 
            className={activeSection === "targets" ? "active" : ""}
            onClick={(e) => {
              e.preventDefault();
              handleNavigation("targets", "/targets");
            }}
          >
            <FaBullseye style={{ marginRight: "5px" }} />
            Targets
          </a>
          <a 
            href="#logs" 
            className={activeSection === "logs" ? "active" : ""}
            onClick={(e) => {
              e.preventDefault();
              handleNavigation("logs", "/logs");
            }}
          >
            <FaClipboardList style={{ marginRight: "5px" }} />
            Daily Logs
          </a>
        </nav>
        <div className="navbar-right">
          <div className="dropdown">
            <button className="dropbtn">
              <FaUserCircle size={22} style={{ marginRight: "5px" }} />
              {user?.username || "User"}
            </button>
            <div className="dropdown-content">
              <a 
                href="#profile"
                onClick={(e) => {
                  e.preventDefault();
                  handleNavigation("profile", "/profile");
                }}
              >
                Profile
              </a>
              <a onClick={logout}>Logout</a>
            </div>
          </div>
        </div>
      </header>

      {/* ===== MAIN CONTENT ===== */}
      <div className="main-content">
        {activeSection === "home" ? (
          <>
            {/* ===== HERO ===== */}
            <section className="hero">
              <div className="hero-overlay">
                <h1>Welcome back, {user?.username || "User"} 👋</h1>
                <p>Track your health journey with modern insights</p>
                <div className="hero-buttons">
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
                </div>
              </div>
            </section>

            {/* ===== METRICS ===== */}
            <section className="metrics-section">
              <h2>My Dashboard</h2>
              <div className="metrics-grid">
                <div 
                  className="metric-card"
                  onClick={() => handleNavigation("mymeeting", "/mymeeting")}
                >
                  <FaCalendarAlt size={30} className="icon" /> {/* 👈 icon mới */}
                  <h3>My Meetings</h3>
                  <p>View and manage your scheduled meetings</p>
                </div>
                <div 
                  className="metric-card"
                  onClick={() => handleNavigation("targets", "/targets")}
                >
                  <FaBullseye size={30} className="icon" />
                  <h3>My Targets</h3>
                  <p>Manage your health goals</p>
                </div>
                <div 
                  className="metric-card"
                  onClick={() => handleNavigation("logs", "/logs")}
                >
                  <FaClipboardList size={30} className="icon" />
                  <h3>Daily Logs</h3>
                  <p>Track daily health data</p>
                </div>
              </div>
            </section>
          </>
        ) : (
          /* ===== IFRAME CONTAINER ===== */
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
