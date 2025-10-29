import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../assets/styles/UserCSS/Notifications.css";
import { FaTimes } from "react-icons/fa";
import { getUserNotifications, markAsRead, deleteNotification } from "../../services/notificationService";

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

  const handleDeleteNotification = async (notificationId, event) => {
    event.stopPropagation(); // Prevent triggering handleNotificationClick
    if (window.confirm("Are you sure you want to delete this notification?")) {
      try {
        await deleteNotification(notificationId, localStorage.getItem("token"));
        setNotifications(notifications.filter(n => n.id !== notificationId));
        if (selectedNotification && selectedNotification.id === notificationId) {
          setSelectedNotification(null); // Close popup if deleted notification was open
        }
        alert("Notification deleted successfully!");
      } catch (err) {
        console.error("Error deleting notification:", err);
        alert("Failed to delete notification. Please try again.");
      }
    }
  };

  if (loading) {
    return (
      <div className="user-main-container">
        <div className="iframe-container">
          <div className="loading-container">
            <p>Đang tải thông báo...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="user-main-container">
      <div className="iframe-container">
        <div className="notifications-container">
          <h2 className="notifications-title">
            Your Notifications
          </h2>

          {error && (
            <p className="notifications-error">
              {error}
            </p>
          )}

          {notifications.length === 0 ? (
            <p className="notifications-empty">
              No notifications available
            </p>
          ) : (
            <div className="notifications-list">
              {notifications.map(notification => (
                <button
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`notification-item ${notification.read ? '' : 'unread'}`}
                >
                  <div className="notification-content">
                    {/* Đường kẻ phân cách - ĐẶT SAU NÚT XOÁ */}
                    <div className="notification-divider"></div>
                    <p className="notification-message">
                      {notification.message}
                    </p>
                    <p className="notification-time">
                      {notification.startTime && notification.endTime ? (
                        <>
                          Start: {new Date(notification.startTime).toLocaleString('vi-VN')} <br />
                          End: {new Date(notification.endTime).toLocaleString('vi-VN')}
                        </>
                      ) : (
                        `Time: ${new Date(notification.timestamp).toLocaleString('vi-VN')}`
                      )}
                    </p>
                    
                    {/* Nút xoá */}
                    <button
                      onClick={(event) => handleDeleteNotification(notification.id, event)}
                      className="delete-button"
                      title="Delete notification"
                    >
                      <FaTimes />
                    </button>
                    

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
          <div className="popup-overlay" onClick={closePopup} />
          <div className="popup-content">
            <div className="popup-header">
              <h3 className="popup-title">
                Notification Details
              </h3>
              <button
                onClick={closePopup}
                className="close-button"
              >
                <FaTimes />
              </button>
            </div>
            <p className="popup-message">
              {selectedNotification.message}
            </p>
            <p className="popup-time">
              {selectedNotification.startTime && selectedNotification.endTime ? (
                <>
                  Start: {new Date(selectedNotification.startTime).toLocaleString('vi-VN')} <br />
                  End: {new Date(selectedNotification.endTime).toLocaleString('vi-VN')}
                </>
              ) : (
                `Time: ${new Date(selectedNotification.timestamp).toLocaleString('vi-VN')}`
              )}
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default Notifications;