import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../assets/styles/UserCSS/UserMainPages.css";
import { FaTimes } from "react-icons/fa";

const Notifications = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([
    { id: 1, message: "New meeting scheduled for tomorrow", timestamp: "2025-10-21 10:00", read: false },
    { id: 2, message: "Room booking request pending", timestamp: "2025-10-21 09:30", read: false },
    { id: 3, message: "Meeting with Team A rescheduled", timestamp: "2025-10-20 15:45", read: false }
  ]);
  const [selectedNotification, setSelectedNotification] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token || !userData) {
      navigate("/login");
    } else {
      setUser(JSON.parse(userData));
    }
  }, [navigate]);

  const handleNotificationClick = (notification) => {
    setSelectedNotification(notification);
    setNotifications(notifications.map(n =>
      n.id === notification.id ? { ...n, read: true } : n
    ));
  };

  const closePopup = () => {
    setSelectedNotification(null);
  };

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
                      {notification.timestamp}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
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
              {selectedNotification.timestamp}
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