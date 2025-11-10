import React, { useEffect, useState, useRef, useContext } from "react";
import { useNavigate } from "react-router-dom";
import "../../assets/styles/UserCSS/UserMainPages.css";
import { 
  FaUserCircle, 
  FaBullseye, 
  FaClipboardList, 
  FaHome, 
  FaTimes, 
  FaCalendarAlt,
  FaTv,
  FaComments,
  FaCalendarDay,
  FaSun,
  FaMoon
} from "react-icons/fa";
import { getUserNotifications } from "../../services/notificationService";
import { getUserById } from "../../services/userService";

const UserMainPages = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeSection, setActiveSection] = useState("home");
  const [iframeUrl, setIframeUrl] = useState("");
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const dropdownRef = useRef(null);
  const iframeRef = useRef(null); // Ref cho iframe

  // Kiểm tra trạng thái dark mode từ localStorage khi tải trang
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      setIsDarkMode(true);
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);


  // Xử lý chuyển đổi dark mode và gửi message đến iframe
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    if (!isDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }

    // Gửi message đến iframe nếu iframe đang load
    if (iframeRef.current && iframeUrl) {
      iframeRef.current.contentWindow.postMessage({ type: 'toggleDarkMode', isDark: !isDarkMode }, '*');
    }

    setTimeout(() => {
    window.location.reload();
  }, 0);
  };
  const [avatarUrl, setAvatarUrl] = useState(null);


  const fetchUserProfile = async (userId) => {
    try {
      const userData = await getUserById(userId);
      setUser(userData);
      setAvatarUrl(userData.avatar || null);
      localStorage.setItem('user', JSON.stringify(userData));
    } catch (err) {
      console.error("Failed to fetch user profile:", err);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token || !userData) {
      navigate("/login");
      return;
    }

    let userId;
    try {
      const parsedUser = JSON.parse(userData);
      userId = parsedUser.id || parsedUser.userId || parsedUser._id;
      if (!userId) throw new Error("User ID not found");

      // Set initial user (from localStorage)
      setUser(parsedUser);

      fetchUserProfile(userId);
    } catch (err) {
      console.error("Invalid user data:", err);
      navigate("/login");
      return;
    }

    const fetchNotifications = async () => {
      try {
        const data = await getUserNotifications(userId, token);
        const notifs = data || [];
        setNotifications(notifs);
        const unread = notifs.filter(n => !n.read).length;
        setUnreadCount(unread);
      } catch (err) {
        console.error("Failed to load notifications:", err);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [navigate]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token || !userData) {
      navigate("/login");
      return;
    }

    let userId;
    try {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      userId = parsedUser.id || parsedUser.userId || parsedUser._id;

      if (!userId) throw new Error("User ID not found");
    } catch (err) {
      console.error("Invalid user data:", err);
      navigate("/login");
      return;
    }

    const fetchNotifications = async () => {
      try {
        const data = await getUserNotifications(userId, token);
        const notifs = data || [];
        setNotifications(notifs);
        const unread = notifs.filter(n => !n.read).length;
        setUnreadCount(unread);
      } catch (err) {
        console.error("Failed to load notifications:", err);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [navigate]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    const handleMessage = (event) => {
      if (event.data.type === "requestDarkMode") {
        if (iframeRef.current && iframeUrl) {
          iframeRef.current.contentWindow.postMessage({ type: 'toggleDarkMode', isDark: isDarkMode }, '*');
        }
      } else if (event.data === "notificationRead") {
        const token = localStorage.getItem("token");
        const userData = localStorage.getItem("user");
        if (token && userData) {
          let userId;
          try {
            const parsedUser = JSON.parse(userData);
            userId = parsedUser.id || parsedUser.userId || parsedUser._id;
            if (userId) {
              const fetchNotifications = async () => {
                try {
                  const data = await getUserNotifications(userId, token);
                  const notifs = data || [];
                  setNotifications(notifs);
                  const unread = notifs.filter(n => !n.read).length;
                  setUnreadCount(unread);
                } catch (err) {
                  console.error("Failed to load notifications:", err);
                }
              };
              fetchNotifications();
            }
          } catch (err) {
            console.error("Invalid user data:", err);
          }
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("message", handleMessage);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data === 'avatarUpdated') {
        const userData = localStorage.getItem("user");
        if (userData) {
          let userId;
          try {
            const parsedUser = JSON.parse(userData);
            userId = parsedUser.id || parsedUser.userId || parsedUser._id;
            if (userId) {
              fetchUserProfile(userId);
            }
          } catch (err) {
            console.error("Invalid user data:", err);
          }
        }
      }
    };

    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);""

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const handleNavigation = (section, url) => {
    setActiveSection(section);
    setIframeUrl(url);
    setDropdownOpen(false);
  };
;

  useEffect(() => {
  if (iframeRef.current && iframeUrl) {
    // Gửi trạng thái dark mode khi iframe được tải
    iframeRef.current.contentWindow.postMessage(
      { type: 'toggleDarkMode', isDark: isDarkMode },
      '*'
    );
  }
}, [iframeRef, iframeUrl, isDarkMode]);

  const getInitials = (name) => name ? name.charAt(0).toUpperCase() : 'U';

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
              handleNavigation("home", "/user");
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
          <a
            href="#calendar"
            className={activeSection === "calendar" ? "active" : ""}
            onClick={(e) => {
              e.preventDefault();
              handleNavigation("calendar", "/Calendar");
            }}
          >
            <FaCalendarDay style={{ marginRight: "5px" }} />
            Calendar
          </a>
          <a
            href="#chatbot"
            className={activeSection === "chatbot" ? "active" : ""}
            onClick={(e) => {
              e.preventDefault();
              handleNavigation("chatbot", "/chatbot");
            }}
          >
            <FaComments style={{ marginRight: "5px" }} />
            ChatBot
          </a>
        </nav>
       <div className="navbar-right">
          <div className="dropdown" ref={dropdownRef}>
            <button 
              className="dropbtn" 
              onClick={() => setDropdownOpen(!isDropdownOpen)}
            >
              {/* CUSTOM AVATAR DISPLAY */}
              {avatarUrl ? (
                <img 
                  src={`${avatarUrl}?t=${Date.now()}`} 
                  alt="Avatar" 
                  className="user-avatar-img"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    setAvatarUrl(null); // fallback
                  }}
                />
              ) : (
                <div className="user-avatar-placeholder">
                  {getInitials(user?.username)}
                </div>
              )}
              <span className="username-text">
                {user?.username || "User"}
              </span>
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
                  <span className="notification-dot" style={{ top: "12px", right: "12px" }}></span>
                )}
              </a>
              <a onClick={logout}>Logout</a>  
              <a
                href="#dark-mode"
                onClick={(e) => {
                  e.preventDefault();
                  toggleDarkMode();
                  setDropdownOpen(false);
                }}
              >
                {isDarkMode ? (
                  <>
                     Light Mode
                  </>
                ) : (
                  <>
                     Dark Mode
                  </>
                )}
              </a>
            </div>
          </div>
        </div>
      </header>

      <div className="main-content">
        {activeSection === "home" ? (
          <>
            <section className="hero">
              <div className="hero-overlay">
                <h1>Welcome back, {user?.username || "User"} 👋</h1>
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
                  onClick={() => handleNavigation("AvailableRoom", "/AvailableRoom")}
                >
                  <FaClipboardList size={40} className="icon" />
                  <h3>Available Rooms</h3>
                  <p>Track available rooms for meetings</p>
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
                <div
                  className="metric-card"
                  onClick={() => handleNavigation("calendar", "/Calendar")}
                >
                  <FaCalendarDay size={40} className="icon" />
                  <h3>Calendar</h3>
                  <p>View your schedule in calendar format</p>
                </div>
              </div>
            </section>
          </>
        ) : (
          <div className="iframe-container">
            <iframe
              ref={iframeRef} // Thêm ref để truy cập contentWindow
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