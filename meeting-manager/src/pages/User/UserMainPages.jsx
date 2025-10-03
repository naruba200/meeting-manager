import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../assets/styles/UserCSS/UserMainPages.css";
import { FaUserCircle, FaBullseye, FaChartLine, FaClipboardList } from "react-icons/fa";

const UserMainPages = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token || !userData) {
      navigate("/login");
    } else {
      setUser(JSON.parse(userData));
    }
  }, [navigate]);

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="user-main-container">
      {/* ===== NAVBAR ===== */}
      <header className="navbar">
        <div className="navbar-left">
          <span className="brand">Healthcare Tracker</span>
        </div>
        <nav className="navbar-center">
          <a href="#home">Home</a>
          <a href="#progress">Progress</a>
          <a href="#targets">Targets</a>
          <a href="#logs">Daily Logs</a>
        </nav>
        <div className="navbar-right">
          <div className="dropdown">
            <button className="dropbtn">
              <FaUserCircle size={22} style={{ marginRight: "5px" }} />
              {user?.username || "User"}
            </button>
            <div className="dropdown-content">
              <a href="#profile">Profile</a>
              <a onClick={logout}>Logout</a>
            </div>
          </div>
        </div>
      </header>

      {/* ===== HERO ===== */}
      <section className="hero">
        <div className="hero-overlay">
          <h1>Welcome back, {user?.username || "User"} 👋</h1>
          <p>Track your health journey with modern insights</p>
          <div className="hero-buttons">
            <button className="btn-primary">View Dashboard</button>
            <button className="btn-secondary">Add New Log</button>
          </div>
        </div>
      </section>

      {/* ===== METRICS ===== */}
      <section className="metrics-section">
        <h2>My Dashboard</h2>
        <div className="metrics-grid">
          <div className="metric-card">
            <FaChartLine size={30} className="icon" />
            <h3>Progress Records</h3>
            <p>Check your improvements</p>
          </div>
          <div className="metric-card">
            <FaBullseye size={30} className="icon" />
            <h3>My Targets</h3>
            <p>Manage your health goals</p>
          </div>
          <div className="metric-card">
            <FaClipboardList size={30} className="icon" />
            <h3>Daily Logs</h3>
            <p>Track daily health data</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default UserMainPages;
