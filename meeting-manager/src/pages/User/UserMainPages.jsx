import React, { useEffect, useState, useRef, useCallback } from "react";
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
  FaEnvelope,
} from "react-icons/fa";
import { getUserNotifications } from "../../services/notificationService";
import { getUserById } from "../../services/userService";

const NAV_ITEMS = [
  { id: "home", label: "Home", icon: FaHome, path: "/user" },
  { id: "mymeeting", label: "My Meetings", icon: FaCalendarAlt, path: "/user/mymeeting" },
  { id: "invited-meetings", label: "Invited Meetings", icon: FaEnvelope, path: "/user/invited-meetings" },
  { id: "AvailableRoom", label: "Available Rooms", icon: FaBullseye, path: "/user/available-rooms" },
  { id: "equipment", label: "Equipment", icon: FaTv, path: "/user/equipment" },
  { id: "calendar", label: "Calendar", icon: FaCalendarDay, path: "/user/calendar" },
  { id: "chatbot", label: "ChatBot", icon: FaComments, path: "/user/chatbot" },
];

const METRIC_CARDS = [
    { id: "mymeeting", title: "My Meetings", description: "View and manage your scheduled meetings", icon: FaCalendarAlt, path: "/mymeeting" },
    { id: "invited-meetings", title: "Invited meetings", description: "Respond to invitation", icon: FaEnvelope, path: "/invited-meetings" },
    { id: "AvailableRoom", title: "Available Rooms", description: "Track available rooms for meetings", icon: FaClipboardList, path: "/available-rooms" },
    { id: "notifications", title: "Notifications", description: "View all your notifications", icon: FaBullseye, path: "/notifications" },
    { id: "equipment", title: "Equipment", description: "View available meeting equipment", icon: FaTv, path: "/equipment" },
    { id: "calendar", title: "Calendar", description: "View your schedule in calendar format", icon: FaCalendarDay, path: "/calendar" },
];


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

  const fetchUserProfile = useCallback(async (userId) => {
    try {
      const userData = await getUserById(userId);
      setUser(userData);
      setAvatarUrl(userData.avatar || null);
      localStorage.setItem("user", JSON.stringify(userData));
    } catch (err) {
      console.error("Failed to fetch user profile:", err);
    }
  }, []);

  useEffect(() => {
    // Load theme preference
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      setIsDarkMode(true);
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    // User authentication and data loading
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
        try {
            const data = await getUserNotifications(userId);
            const notifs = data || [];
            setNotifications(notifs);
            setUnreadCount(notifs.filter((n) => !n.read).length);
        } catch (error) {
            console.error("Failed to load notifications:", error);
        }
      };

      loadNotifications();
      const interval = setInterval(loadNotifications, 30000);
      return () => clearInterval(interval);
    } catch (err) {
      console.error("Invalid user data:", err);
      navigate("/login");
    }
  }, [navigate, fetchUserProfile]);

  useEffect(() => {
    // Handle avatar update messages from other tabs/windows
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

    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("message", handleMessage);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [fetchUserProfile]);

  useEffect(() => {
    const currentPath = location.pathname;
    const section = NAV_ITEMS.find(item => currentPath.startsWith(item.path) && item.path !== "/user")?.id || "home";
    setActiveSection(section);
  }, [location.pathname]);

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
    
    navigate("/user");
  };

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const handleNavigation = (section, path) => {
    setActiveSection(section);
    navigate(path);
    setDropdownOpen(false);
  };

  const getInitials = (name) => (name ? name.charAt(0).toUpperCase() : "U");

  return (
    <div className={`user-main-container ${isDarkMode ? "dark" : ""}`}>
      <header className="navbar">
        <div className="navbar-left">
          <span className="brand">Meeting Scheduling Website</span>
        </div>

        <nav className="navbar-center">
          {NAV_ITEMS.map(({ id, label, icon: Icon, path }) => (
            <a
              key={id}
              href={`#${id}`}
              className={activeSection === id ? "active" : ""}
              onClick={(e) => {
                e.preventDefault();
                handleNavigation(id, path);
              }}
            >
              <Icon style={{ marginRight: "5px" }} /> {label}
            </a>
          ))}
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
                  onError={() => setAvatarUrl(null)}
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
              <a href="#profile" onClick={(e) => { e.preventDefault(); handleNavigation("profile", "/user/profile"); }}>
                Profile
              </a>
              <a href="#notifications" onClick={(e) => { e.preventDefault(); handleNavigation("notifications", "/user/notifications"); }} style={{ position: "relative" }}>
                Notifications
                {unreadCount > 0 && <span className="notification-dot" style={{ top: "12px", right: "12px" }}></span>}
              </a>
              <a href="#dark-mode" onClick={(e) => { e.preventDefault(); toggleDarkMode(); }}>
                {isDarkMode ? "Light Mode" : "Dark Mode"}
              </a>
              <a onClick={logout}>Logout</a>
            </div>
          </div>
        </div>
      </header>

      <div className="main-content">
        {location.pathname === "/user" ? (
          <>
            <section className="hero">
              <div className="hero-overlay">
                <h1>Welcome back, {user?.username || "User"}</h1>
                <p>Track your meeting schedule with modern insights</p>
              </div>
            </section>

            <section className="metrics-section">
              <div className="metrics-grid">
                {METRIC_CARDS.map(({ id, title, description, icon: Icon, path }) => (
                    <div key={id} className="metric-card" onClick={() => handleNavigation(id, `/user${path}`)}>
                        <Icon size={40} className="icon" />
                        <h3>{title}</h3>
                        <p>{description}</p>
                    </div>
                ))}
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
