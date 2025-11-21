// import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import "../../assets/styles/Settings.css";
import { ThemeContext } from "../../context/contexts.jsx";

const Settings = () => {
  const navigate = useNavigate();

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
      <h2 className="settings-title">System Settings</h2>

      <div className="settings-section">
        <h3>Account</h3>
        <p>Manage user account, change password, or log out from the system.</p>
        <button className="logout-btn" onClick={handleLogout}>
          Log Out
        </button>
      </div>

      {/* <div className="settings-section">
        <h3>Appearance</h3>
        <p>Customize the display mode between light and dark themes.</p>
        <button className="btn-secondary" onClick={toggleTheme}>
          {theme === "light" ? "Enable Dark Mode 🌙" : "Enable Light Mode ☀️"}
        </button>
      </div> */}
    </div>
  );
};

export default Settings;
