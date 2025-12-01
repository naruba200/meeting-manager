import React from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { FaCalendarAlt, FaClipboardList, FaBullseye, FaTv, FaCalendarDay } from "react-icons/fa";

const UserHome = () => {
    const { user } = useOutletContext();
    const navigate = useNavigate();

    const handleNavigation = (path) => {
        navigate(path);
    }

    return (
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
                        onClick={() => handleNavigation("/user/mymeeting")}
                    >
                        <FaCalendarAlt size={40} className="icon" />
                        <h3>My Meetings</h3>
                        <p>View and manage your scheduled meetings</p>
                    </div>
                    <div
                        className="metric-card"
                        onClick={() => handleNavigation("/user/AvailableRoom")}
                    >
                        <FaClipboardList size={40} className="icon" />
                        <h3>Available Rooms</h3>
                        <p>Track available rooms for meetings</p>
                    </div>
                    <div
                        className="metric-card"
                        onClick={() => handleNavigation("/user/notifications")}
                    >
                        <FaBullseye size={40} className="icon" />
                        <h3>Notifications</h3>
                        <p>View all your notifications</p>
                    </div>
                    <div
                        className="metric-card"
                        onClick={() => handleNavigation("/user/equipment")}
                    >
                        <FaTv size={40} className="icon" />
                        <h3>Equipment</h3>
                        <p>View available meeting equipment</p>
                    </div>
                    {/* Thêm Calendar card vào metrics grid */}
                    <div
                        className="metric-card"
                        onClick={() => handleNavigation("/user/Calendar")}
                    >
                        <FaCalendarDay size={40} className="icon" />
                        <h3>Calendar</h3>
                        <p>View your schedule in calendar format</p>
                    </div>
                </div>
            </section>
        </>
    );
}

export default UserHome;