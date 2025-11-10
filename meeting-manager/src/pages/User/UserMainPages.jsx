import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import "../../assets/styles/UserCSS/UserMainPages.css";
import {
  FaUserCircle,
  FaBullseye,
  FaClipboardList,
  FaHome,
  FaCalendarAlt,
  FaTv,
  FaComments,
  FaCalendarDay,
  FaEnvelope
} from "react-icons/fa";
import { getUserNotifications } from "../../services/notificationService";
import { getUserById } from "../../services/userService";

const UserMainPages = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef(null);

  const [user, setUser] = useState(null);
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const [avatarUrl, setAvatarUrl] = useState(null);

  // Load dark mode preference
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      setIsDarkMode(true);
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);

    if (newMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }

    // Return to home page after switching theme
    setActiveSection("home");
    navigate("/user");

    // Optional short delay to ensure CSS class applies smoothly
    setTimeout(() => {
      document.body.offsetHeight; // force reflow (ensures visual update)
    }, 50);
  };


  const fetchUserProfile = async (userId) => {
    try {
      const userData = await getUserById(userId);
      setUser(userData);
      setAvatarUrl(userData.avatar || null);
      localStorage.setItem("user", JSON.stringify(userData));
    } catch (err) {
      console.error("Failed to fetch user profile:", err);
    }
  };

  // Load user + notifications
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    if (!token || !userData) {
      navigate("/login");
      return;
    }

    try {
      const parsedUser = JSON.parse(userData);
      const userId = parsedUser.id || parsedUser.userId || parsedUser._id;
      if (!userId) throw new Error("User ID not found");
      setUser(parsedUser);
      fetchUserProfile(userId);

      const loadNotifications = async () => {
        const data = await getUserNotifications(userId);
        const notifs = data || [];
        setNotifications(notifs);
        setUnreadCount(notifs.filter((n) => !n.read).length);
      };
      loadNotifications();
      const interval = setInterval(loadNotifications, 30000);
      return () => clearInterval(interval);
    } catch (err) {
      console.error("Invalid user data:", err);
      navigate("/login");
    }
  }, [navigate]);

  // Handle avatar update messages
  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data === "avatarUpdated") {
        const userData = localStorage.getItem("user");
        if (userData) {
          const parsedUser = JSON.parse(userData);
          const userId = parsedUser.id || parsedUser.userId || parsedUser._id;
          if (userId) fetchUserProfile(userId);
        }
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const handleNavigation = (section, path) => {
    setActiveSection(section);
    navigate(`/user${path}`);
    setDropdownOpen(false);
  };

  const getInitials = (name) => (name ? name.charAt(0).toUpperCase() : "U");

  useEffect(() => {
    if (location.pathname.startsWith("/user/mymeeting")) {
      setActiveSection("mymeeting");
    } else if (location.pathname.startsWith("/user/available-rooms")) {
      setActiveSection("AvailableRoom");
    } else if (location.pathname.startsWith("/user/equipment")) {
      setActiveSection("equipment");
    } else if (location.pathname.startsWith("/user/calendar")) {
      setActiveSection("calendar");
    } else if (location.pathname.startsWith("/user/chatbot")) {
      setActiveSection("chatbot");
    } else if (location.pathname.startsWith("/user/profile")) {
      setActiveSection("profile");
    } else if (location.pathname.startsWith("/user/notifications")) {
      setActiveSection("notifications");
    } else {
      setActiveSection("home");
    }
  }, [location.pathname]);

  return (
    <div className={`user-main-container ${isDarkMode ? "dark" : ""}`}>
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
              setActiveSection("home");
              navigate("/user");
            }}
          >
            <FaHome style={{ marginRight: "5px" }} /> Home
          </a>
          <a
            href="#mymeeting"
            className={activeSection === "mymeeting" ? "active" : ""}
            onClick={(e) => {
              e.preventDefault();
              handleNavigation("mymeeting", "/mymeeting");
            }}
          >
            <FaCalendarAlt style={{ marginRight: "5px" }} /> My Meetings
          </a>
          <a
            href="#AvailableRoom"
            className={activeSection === "AvailableRoom" ? "active" : ""}
            onClick={(e) => {
              e.preventDefault();
              handleNavigation("AvailableRoom", "/available-rooms");
            }}
          >
            <FaBullseye style={{ marginRight: "5px" }} /> Available Rooms
          </a>
          <a
            href="#equipment"
            className={activeSection === "equipment" ? "active" : ""}
            onClick={(e) => {
              e.preventDefault();
              handleNavigation("equipment", "/equipment");
            }}
          >
            <FaTv style={{ marginRight: "5px" }} /> Equipment
          </a>
          <a
            href="#calendar"
            className={activeSection === "calendar" ? "active" : ""}
            onClick={(e) => {
              e.preventDefault();
              handleNavigation("calendar", "/calendar");
            }}
          >
            <FaCalendarDay style={{ marginRight: "5px" }} /> Calendar
          </a>
          <a
            href="#chatbot"
            className={activeSection === "chatbot" ? "active" : ""}
            onClick={(e) => {
              e.preventDefault();
              handleNavigation("chatbot", "/chatbot");
            }}
          >
            <FaComments style={{ marginRight: "5px" }} /> ChatBot
          </a>
        </nav>

        <div className="navbar-right">
          <div className="dropdown" ref={dropdownRef}>
            <button
              className="dropbtn"
              onClick={() => setDropdownOpen(!isDropdownOpen)}
            >
              {avatarUrl ? (
                <img
                  src={`${avatarUrl}?t=${Date.now()}`}
                  alt="Avatar"
                  className="user-avatar-img"
                  onError={(e) => {
                    e.target.style.display = "none";
                    setAvatarUrl(null);
                  }}
                />
              ) : (
                <div className="user-avatar-placeholder">
                  {getInitials(user?.username)}
                </div>
              )}
              <span className="username-text">{user?.username || "User"}</span>
              {unreadCount > 0 && <span className="notification-dot"></span>}
            </button>

            <div className={`dropdown-content ${isDropdownOpen ? "open" : ""}`}>
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
                {unreadCount > 0 && (
                  <span
                    className="notification-dot"
                    style={{ top: "12px", right: "12px" }}
                  ></span>
                )}
              </a>
              <a
                href="#dark-mode"
                onClick={(e) => {
                  e.preventDefault();
                  toggleDarkMode();
                }}
              >
                {isDarkMode ? "Light Mode" : "Dark Mode"}
              </a>
              <a onClick={logout}>Logout</a>
            </div>
          </div>
        </div>
      </header>

      <div className="main-content">
        {activeSection === "home" && location.pathname === "/user" ? (
          <>
            <section className="hero">
              <div className="hero-overlay">
                <h1>Welcome back, {user?.username || "User"}</h1>
                <p>Track your meeting schedule with modern insights</p>
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
                  onClick={() =>
                    handleNavigation("invited-meetings", "/invited-meetings")
                  }
                >
                  <FaEnvelope size={40} className="icon" />
                  <h3>Cuộc họp được mời</h3>
                  <p>Phản hồi lời mời tham gia</p>
                </div>
                <div
                  className="metric-card"
                  onClick={() =>
                    handleNavigation("AvailableRoom", "/available-rooms")
                  }
                >
                  <FaClipboardList size={40} className="icon" />
                  <h3>Available Rooms</h3>
                  <p>Track available rooms for meetings</p>
                </div>
                <div
                  className="metric-card"
                  onClick={() =>
                    handleNavigation("notifications", "/notifications")
                  }
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
                <div
                  className="metric-card"
                  onClick={() => handleNavigation("calendar", "/calendar")}
                >
                  <FaCalendarDay size={40} className="icon" />
                  <h3>Calendar</h3>
                  <p>View your schedule in calendar format</p>
                </div>
              </div>
            </section>
          </>
        ) : (
          <Outlet />
        )}
      </div>
    </div>
  );
};

export default UserMainPages;
