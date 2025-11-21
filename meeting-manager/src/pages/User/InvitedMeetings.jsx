// src/pages/User/InvitedMeetings.js
import React, { useState, useEffect } from "react";
import { FaEye, FaCheck, FaTimes, FaSearch, FaCalendarAlt, FaEnvelope } from "react-icons/fa";
import moment from "moment-timezone";
import "../../assets/styles/UserCSS/MyMeeting.css"; // Dùng chung CSS
import {
    getInvitedMeetings,
    respondToInvite,
    getMeetingById,
    getMeetingParticipants
} from "../../services/meetingServiceUser.js";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const InvitedMeetings = () => {
    const [search, setSearch] = useState("");
    const [meetings, setMeetings] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedMeeting, setSelectedMeeting] = useState(null);
    const [participants, setParticipants] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [declineReason, setDeclineReason] = useState("");
    const [showDeclineInput, setShowDeclineInput] = useState(false);

    const user = JSON.parse(localStorage.getItem("user"));
    const userId = user?.userId;

    useEffect(() => {
        if (!userId) return;
        fetchInvitedMeetings();
    }, [userId]);

    const fetchInvitedMeetings = async () => {
        try {
            const data = await getInvitedMeetings(userId);
            setMeetings(data);
        } catch (error) {
            toast.error("Lỗi tải danh sách cuộc họp được mời!");
        }
    };

    const handleOpenModal = async (meeting) => {
        setSelectedMeeting(meeting);
        setShowDeclineInput(false);
        setDeclineReason("");
        try {
            const [detail, participantList] = await Promise.all([
                getMeetingById(meeting.meetingId),
                getMeetingParticipants(meeting.meetingId)
            ]);
            setSelectedMeeting(detail);
            setParticipants(participantList);
        } catch (error) {
            toast.error("Lỗi tải thông tin cuộc họp!");
        } finally {
            setShowModal(true);
        }
    };

    const handleRespond = async (status) => {
        if (status === "DECLINED" && !declineReason.trim()) {
            toast.warning("Vui lòng nhập lý do từ chối!");
            return;
        }
        setIsLoading(true);
        try {
            await respondToInvite(selectedMeeting.meetingId, status, declineReason);
            toast.success(status === "ACCEPTED" ? "Accepted invitation!" : "Declined invitation!");
            setMeetings(prev => prev.filter(m => m.meetingId !== selectedMeeting.meetingId));
            setShowModal(false);
        } catch (error) {
            toast.error("Error when responding!");
        } finally {
            setIsLoading(false);
        }
    };

    const filteredMeetings = meetings.filter(m =>
        m.title.toLowerCase().includes(search.toLowerCase())
    );

    const renderStatus = (status) => {
        switch (status?.toUpperCase()) {
            case 'ACCEPTED': return <span className="status-accepted">Accepted</span>;
            case 'DECLINED': return <span className="status-declined">Declined</span>;
            case 'PENDING': return <span className="status-pending">Waiting for respond</span>;
            default: return <span className="status-text">{status}</span>;
        }
    };

    return (
        <div className="my-meeting-container">
            <ToastContainer position="top-right" autoClose={2500} />

            <div className="user-header">
                <div className="header-title">
                    <h2><FaEnvelope /> Invited Meetings</h2>
                    <p>List of meetings you have been invited to</p>
                </div>
                <div className="search-bar">
                    <FaSearch className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="meetings-cards-container">
                {filteredMeetings.length === 0 ? (
                    <div className="empty-state">
                        <FaCalendarAlt style={{ fontSize: "48px", color: "#9ca3af", marginBottom: "16px" }} />
                        <h3>Nothing to see here</h3>
                        <p>Meetings will appear here if someone invited you.</p>
                    </div>
                ) : (
                    <div className="meetings-grid">
                        {filteredMeetings.map((meeting) => (
                            <div key={meeting.meetingId} className="meeting-card">
                                <div className="card-header">
                                    <h4 className="meeting-title">{meeting.title}</h4>
                                    {renderStatus(meeting.inviteStatus)}
                                </div>
                                <div className="card-body">
                                    <p><strong>Time:</strong> {moment.tz(meeting.startTime, 'Asia/Ho_Chi_Minh').format('DD/MM/YYYY HH:mm')}</p>
                                    <p><strong>Room:</strong> {meeting.roomName || "Chưa xác định"}</p>
                                    <p><strong>Organizer:</strong> {meeting.organizerName}</p>
                                    {meeting.inviteStatus === 'DECLINED' && meeting.declineReason && (
                                        <p><strong>Reason:</strong> {meeting.declineReason}</p>
                                    )}
                                </div>
                                <div className="card-footer">
                                    {meeting.inviteStatus === 'PENDING' && (
                                        <>
                                            <button className="btn-accept" onClick={() => handleOpenModal(meeting)}>
                                                <FaCheck /> Accept
                                            </button>
                                            <button className="btn-decline" onClick={() => handleOpenModal(meeting)}>
                                                <FaTimes /> Decline
                                            </button>
                                        </>
                                    )}
                                    {meeting.inviteStatus !== 'PENDING' && (
                                        <button className="btn-view" onClick={() => handleOpenModal(meeting)}>
                                            <FaEye /> View Details
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal chi tiết */}
            {showModal && selectedMeeting && (
                <div className="modal-overlay">
                    <div className="modal-container">
                        <div className="modal-header">
                            <h3>Meeting details</h3>
                            <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
                        </div>
                        <div className="modal-body">
                            <div className="user-form-group">
                                <label>Title</label>
                                <p>{selectedMeeting.title}</p>
                            </div>
                            <div className="user-form-group">
                                <label>Description</label>
                                <p>{selectedMeeting.description || "Không có"}</p>
                            </div>
                            <div className="user-form-group">
                                <label>Start time</label>
                                <p>{moment.tz(selectedMeeting.startTime, 'Asia/Ho_Chi_Minh').format('DD/MM/YYYY HH:mm')}</p>
                            </div>
                            <div className="user-form-group">
                                <label>End time</label>
                                <p>{moment.tz(selectedMeeting.endTime, 'Asia/Ho_Chi_Minh').format('DD/MM/YYYY HH:mm')}</p>
                            </div>
                            <div className="user-form-group">
                                <label>Room</label>
                                <p>{selectedMeeting.roomName || "Chưa xác định"}</p>
                            </div>
                            <div className="user-form-group">
                                <label>Organizer</label>
                                <p>{selectedMeeting.organizerName}</p>
                            </div>

                            <div className="user-form-group">
                                <label>Meeting attendees</label>
                                {participants.length === 0 ? (
                                    <p>None</p>
                                ) : (
                                    <div className="participants-grid">
                                        {participants.map(p => (
                                            <div key={p.email} className="participant-card">
                                                <div className="participant-info">
                                                    <h4>{p.username || p.email}</h4>
                                                    <p>{p.email}</p>
                                                    {p.department && <small>{p.department}</small>}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {showDeclineInput && (
                                <div className="user-form-group">
                                    <label>Reason for declining *</label>
                                    <textarea
                                        value={declineReason}
                                        onChange={(e) => setDeclineReason(e.target.value)}
                                        placeholder="Please state your reason..."
                                        rows="3"
                                    />
                                </div>
                            )}
                        </div>

                        <div className="modal-footer">
                            <button className="btn-cancel" onClick={() => setShowModal(false)}>
                                Close
                            </button>

                            {selectedMeeting.inviteStatus === "PENDING" && !showDeclineInput && (
                                <>
                                    <button
                                        className="btn-decline"
                                        onClick={() => setShowDeclineInput(true)}
                                        disabled={isLoading}
                                    >
                                        <FaTimes /> Decline
                                    </button>
                                    <button
                                        className="btn-accept"
                                        onClick={() => handleRespond("ACCEPTED")}
                                        disabled={isLoading}
                                    >
                                        <FaCheck /> Accept
                                    </button>
                                </>
                            )}

                            {showDeclineInput && (
                                <>
                                    <button className="btn-cancel" onClick={() => setShowDeclineInput(false)}>
                                        Cancel
                                    </button>
                                    <button
                                        className="btn-save"
                                        onClick={() => handleRespond("DECLINED")}
                                        disabled={isLoading || !declineReason.trim()}
                                    >
                                        {isLoading ? "Sending..." : "Submit"}
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InvitedMeetings;