import React, { useEffect, useState, useRef } from "react";
import { useNavigate, Outlet, useLocation, Link } from "react-router-dom";
import "../../assets/styles/UserCSS/UserMainPages.css";
import {
  FaUserCircle,
  FaBullseye,
  FaClipboardList,
  FaHome,
  FaTimes,
  FaCalendarAlt,
  FaTv,
  FaComments, // Thêm icon cho ChatBot
  FaCalendarDay // Thêm icon cho calendar
} from "react-icons/fa";
import { getUserNotifications } from "../../services/notificationService";
import { getUserById } from "../../services/userService";

const UserMainPages = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);
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
        // Không bắt lỗi nghiêm trọng, chỉ không hiển thị dot
      }
    };

    fetchNotifications();

    // Tự động cập nhật mỗi 30 giây (tùy chọn)
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [navigate]);



  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    const handleMessage = (event) => {
      if (event.data === 'notificationRead') {
        const token = localStorage.getItem("token");
        const userData = localStorage.getItem("user");
        if (token && userData) {
          let userId;
          try {
            const parsedUser = JSON.parse(userData);
            userId = parsedUser.id || parsedUser.userId || parsedUser._id;
            if(userId) {
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

    window.addEventListener('message', handleMessage);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener('message', handleMessage);
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
  }, []);

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const getInitials = (name) => name ? name.charAt(0).toUpperCase() : 'U';

  return (
    <div className="user-main-container">
      <header className="navbar">
        <div className="navbar-left">
          <span className="brand">Meeting Scheduling Website</span>
        </div>
        <nav className="navbar-center">
          <Link
            to="/user"
            className={location.pathname === "/user" ? "active" : ""}
          >
            <FaHome style={{ marginRight: "5px" }} />
            Home
          </Link>
          <Link
            to="mymeeting"
            className={location.pathname.endsWith("mymeeting") ? "active" : ""}
          >
            <FaCalendarAlt style={{ marginRight: "5px" }} />
            My Meetings
          </Link>
          <Link
            to="AvailableRoom"
            className={location.pathname.endsWith("AvailableRoom") ? "active" : ""}
          >
            <FaBullseye style={{ marginRight: "5px" }} />
            AvailableRoom
          </Link>
          <Link
            to="equipment"
            className={location.pathname.endsWith("equipment") ? "active" : ""}
          >
            <FaTv style={{ marginRight: "5px" }} />
            Equipment
          </Link>
          {/* Thêm Calendar vào navigation */}
          <Link
            to="Calendar"
            className={location.pathname.endsWith("Calendar") ? "active" : ""}
          >
            <FaCalendarDay style={{ marginRight: "5px" }} />
            Calendar
          </Link>
          <Link
            to="chatbot"
            className={location.pathname.endsWith("chatbot") ? "active" : ""}
          >
            <FaComments style={{ marginRight: "5px" }} />
            ChatBot
          </Link>
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

            <div className={`dropdown-content ${isDropdownOpen ? 'open' : ''}`}>
              <Link
                to="profile"
              >
                Profile
              </Link>
              <Link
                to="notifications"
                style={{ position: "relative" }}
              >
                Notifications
                {unreadCount > 0 && (
                  <span className="notification-dot" style={{ top: "12px", right: "12px" }}></span>
                )}
              </Link>
              <a onClick={logout}>Logout</a>
            </div>
          </div>
        </div>
      </header>

      <div className="main-content">
        <Outlet context={{ user }} />
      </div>
    </div>
  );
};

export default UserMainPages;
