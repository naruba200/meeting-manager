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
            toast.success(status === "ACCEPTED" ? "Đã đồng ý tham gia!" : "Đã từ chối tham gia!");
            setMeetings(prev => prev.filter(m => m.meetingId !== selectedMeeting.meetingId));
            setShowModal(false);
        } catch (error) {
            toast.error("Lỗi khi phản hồi lời mời!");
        } finally {
            setIsLoading(false);
        }
    };

    const filteredMeetings = meetings.filter(m =>
        m.title.toLowerCase().includes(search.toLowerCase())
    );

    const renderStatus = (status) => {
        switch (status?.toUpperCase()) {
            case 'ACCEPTED': return <span className="status-accepted">Đã đồng ý</span>;
            case 'DECLINED': return <span className="status-declined">Đã từ chối</span>;
            case 'PENDING': return <span className="status-pending">Chờ phản hồi</span>;
            default: return <span className="status-text">{status}</span>;
        }
    };

    return (
        <div className="my-meeting-container">
            <ToastContainer position="top-right" autoClose={2500} />

            <div className="user-header">
                <div className="header-title">
                    <h2><FaEnvelope /> Cuộc họp được mời</h2>
                    <p>Danh sách các cuộc họp bạn được mời tham gia</p>
                </div>
                <div className="search-bar">
                    <FaSearch className="search-icon" />
                    <input
                        type="text"
                        placeholder="Tìm kiếm..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="meetings-cards-container">
                {filteredMeetings.length === 0 ? (
                    <div className="empty-state">
                        <FaCalendarAlt style={{ fontSize: "48px", color: "#9ca3af", marginBottom: "16px" }} />
                        <h3>Chưa có lời mời nào</h3>
                        <p>Bạn sẽ thấy ở đây khi được mời tham gia cuộc họp.</p>
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
                                    <p><strong>Thời gian:</strong> {moment.tz(meeting.startTime, 'Asia/Ho_Chi_Minh').format('DD/MM/YYYY HH:mm')}</p>
                                    <p><strong>Phòng:</strong> {meeting.roomName || "Chưa xác định"}</p>
                                    <p><strong>Chủ trì:</strong> {meeting.organizerName}</p>
                                    {meeting.inviteStatus === 'DECLINED' && meeting.declineReason && (
                                        <p><strong>Lý do từ chối:</strong> {meeting.declineReason}</p>
                                    )}
                                </div>
                                <div className="card-footer">
                                    {meeting.inviteStatus === 'PENDING' && (
                                        <>
                                            <button className="btn-accept" onClick={() => handleOpenModal(meeting)}>
                                                <FaCheck /> Đồng ý
                                            </button>
                                            <button className="btn-decline" onClick={() => handleOpenModal(meeting)}>
                                                <FaTimes /> Từ chối
                                            </button>
                                        </>
                                    )}
                                    {meeting.inviteStatus !== 'PENDING' && (
                                        <button className="btn-view" onClick={() => handleOpenModal(meeting)}>
                                            <FaEye /> Xem chi tiết
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
                            <h3>Chi tiết cuộc họp</h3>
                            <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
                        </div>
                        <div className="modal-body">
                            <div className="user-form-group">
                                <label>Tiêu đề</label>
                                <p>{selectedMeeting.title}</p>
                            </div>
                            <div className="user-form-group">
                                <label>Mô tả</label>
                                <p>{selectedMeeting.description || "Không có"}</p>
                            </div>
                            <div className="user-form-group">
                                <label>Thời gian bắt đầu</label>
                                <p>{moment.tz(selectedMeeting.startTime, 'Asia/Ho_Chi_Minh').format('DD/MM/YYYY HH:mm')}</p>
                            </div>
                            <div className="user-form-group">
                                <label>Thời gian kết thúc</label>
                                <p>{moment.tz(selectedMeeting.endTime, 'Asia/Ho_Chi_Minh').format('DD/MM/YYYY HH:mm')}</p>
                            </div>
                            <div className="user-form-group">
                                <label>Phòng họp</label>
                                <p>{selectedMeeting.roomName || "Chưa xác định"}</p>
                            </div>
                            <div className="user-form-group">
                                <label>Chủ trì</label>
                                <p>{selectedMeeting.organizerName}</p>
                            </div>

                            <div className="user-form-group">
                                <label>Người tham gia</label>
                                {participants.length === 0 ? (
                                    <p>Chưa có</p>
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
                                    <label>Lý do từ chối *</label>
                                    <textarea
                                        value={declineReason}
                                        onChange={(e) => setDeclineReason(e.target.value)}
                                        placeholder="Vui lòng nhập lý do..."
                                        rows="3"
                                    />
                                </div>
                            )}
                        </div>

                        <div className="modal-footer">
                            <button className="btn-cancel" onClick={() => setShowModal(false)}>
                                Đóng
                            </button>

                            {selectedMeeting.inviteStatus === "PENDING" && !showDeclineInput && (
                                <>
                                    <button
                                        className="btn-decline"
                                        onClick={() => setShowDeclineInput(true)}
                                        disabled={isLoading}
                                    >
                                        <FaTimes /> Từ chối
                                    </button>
                                    <button
                                        className="btn-accept"
                                        onClick={() => handleRespond("ACCEPTED")}
                                        disabled={isLoading}
                                    >
                                        <FaCheck /> Đồng ý
                                    </button>
                                </>
                            )}

                            {showDeclineInput && (
                                <>
                                    <button className="btn-cancel" onClick={() => setShowDeclineInput(false)}>
                                        Hủy
                                    </button>
                                    <button
                                        className="btn-save"
                                        onClick={() => handleRespond("DECLINED")}
                                        disabled={isLoading || !declineReason.trim()}
                                    >
                                        {isLoading ? "Đang gửi..." : "Gửi từ chối"}
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