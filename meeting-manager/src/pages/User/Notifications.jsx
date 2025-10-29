import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../assets/styles/UserCSS/UserMainPages.css";
import { FaTimes } from "react-icons/fa";
import { getUserNotifications, markAsRead } from "../../services/notificationService"; // Đảm bảo đường dẫn đúng

const Notifications = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

      // Thử các trường có thể chứa ID
      userId = parsedUser.id || parsedUser.userId || parsedUser._id;
      
      if (!userId) {
        throw new Error("User ID not found in user data");
      }
    } catch (err) {
      console.error("Invalid user data:", err);
      setError("Dữ liệu người dùng không hợp lệ.");
      setLoading(false);
      return;
    }

    const fetchNotifications = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getUserNotifications(userId, token);
        setNotifications(data || []);
      } catch (err) {
        console.error("Error fetching notifications:", err);
        if (err.response?.status === 400) {
          setError("ID người dùng không hợp lệ. Vui lòng đăng nhập lại.");
        } else {
          setError("Không thể tải thông báo. Vui lòng thử lại.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [navigate]);

  const handleNotificationClick = async (notification) => {
    if (notification.read) {
      setSelectedNotification(notification);
      return;
    }

    try {
      // Gọi API đánh dấu đã đọc
      await markAsRead(notification.id, localStorage.getItem("token"));
      // Refresh notifications in parent window
      window.parent.postMessage('notificationRead', '*');

      // Cập nhật UI
      setNotifications(notifications.map(n =>
        n.id === notification.id ? { ...n, read: true } : n
      ));
      setSelectedNotification({ ...notification, read: true });
    } catch (err) {
      console.error("Error marking notification as read:", err);
      alert("Không thể cập nhật trạng thái thông báo.");
    }
  };

  const closePopup = () => {
    setSelectedNotification(null);
  };

  if (loading) {
    return (
      <div className="user-main-container">
        <div className="iframe-container">
          <div style={{ padding: "32px", textAlign: "center" }}>
            <p>Đang tải thông báo...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="user-main-container">
      <div className="iframe-container">
        <div style={{ padding: "32px", maxWidth: "800px", margin: "0 auto" }}>
          <h2 style={{
            fontSize: "28px",
            marginBottom: "24px",
            color: "#1e293b",
            fontWeight: 700,
            textAlign: "center"
          }}>
            Your Notifications
          </h2>

          {error && (
            <p style={{ color: "red", textAlign: "center", marginBottom: "16px" }}>
              {error}
            </p>
          )}

          {notifications.length === 0 ? (
            <p style={{
              textAlign: "center",
              color: "#64748b",
              fontSize: "16px",
              marginTop: "32px"
            }}>
              No notifications available
            </p>
          ) : (
            <div style={{
              display: "flex",
              flexDirection: "column",
              gap: "16px"
            }}>
              {notifications.map(notification => (
                <button
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  style={{
                    background: notification.read ? "#f8fafc" : "rgba(30, 58, 138, 0.2)",
                    borderRadius: "12px",
                    padding: "16px",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    boxShadow: "0 4px 12px rgba(30, 58, 138, 0.08)",
                    transition: "all 0.3s ease",
                    border: "none",
                    cursor: "pointer",
                    width: "100%",
                    textAlign: "left"
                  }}
                >
                  <div>
                    <p style={{
                      margin: 0,
                      color: "#1e293b",
                      fontWeight: 600,
                      fontSize: "16px"
                    }}>
                      {notification.message}
                    </p>
                    <p style={{
                      margin: 0,
                      color: "#64748b",
                      fontSize: "14px",
                      marginTop: "4px"
                    }}>
                      {new Date(notification.timestamp).toLocaleString('vi-VN')}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Popup chi tiết */}
      {selectedNotification && (
        <>
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0, 0, 0, 0.5)",
              backdropFilter: "blur(5px)",
              WebkitBackdropFilter: "blur(5px)",
              zIndex: 2500
            }}
            onClick={closePopup}
          />
          <div
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              background: "#f8fafc",
              borderRadius: "12px",
              padding: "24px",
              boxShadow: "0 8px 24px rgba(30, 58, 138, 0.2)",
              zIndex: 3000,
              maxWidth: "400px",
              width: "90%",
              animation: "fadeIn 0.3s ease-out"
            }}
          >
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "16px"
            }}>
              <h3 style={{
                margin: 0,
                color: "#1e293b",
                fontSize: "20px",
                fontWeight: 700
              }}>
                Notification Details
              </h3>
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
            </div>
            <p style={{
              margin: 0,
              color: "#1e293b",
              fontSize: "16px",
              fontWeight: 600
            }}>
              {selectedNotification.message}
            </p>
            <p style={{
              margin: 0,
              color: "#64748b",
              fontSize: "14px",
              marginTop: "8px"
            }}>
              {new Date(selectedNotification.timestamp).toLocaleString('vi-VN')}
            </p>
            <style>
              {`
                @keyframes fadeIn {
                  from { opacity: 0; transform: translate(-50%, -60%); }
                  to { opacity: 1; transform: translate(-50%, -50%); }
                }
              `}
            </style>
          </div>
        </>
      )}
    </div>
  );
};

export default Notifications;