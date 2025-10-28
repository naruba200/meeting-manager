// src/components/RecurringMeeting.js
import React, { useState, useEffect } from "react";
import { FaRedo, FaCalendarAlt } from "react-icons/fa"; // ĐÃ SỬA: thêm FaCalendarAlt
import moment from "moment-timezone";
import { createRecurringMeeting, fetchRooms } from "../../services/RecurringService.js";
import Datetime from "react-datetime";
import "react-datetime/css/react-datetime.css";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getMeetingsByOrganizer } from "../../services/meetingServiceUser.js";

// Helper function to extract message inside quotation marks
const extractQuotedMessage = (errorMessage) => {
  const match = errorMessage.match(/"([^"]+)"/);
  return match ? match[1] : errorMessage;
};

const RecurringMeeting = ({ meetings, setMeetings, organizerId }) => {
  const [showRecurringModal, setShowRecurringModal] = useState(false);
  const [recurringForm, setRecurringForm] = useState({
    title: "",
    description: "",
    startTime: "",
    endTime: "",
    roomId: "",
    recurrenceType: "DAILY",
    recurUntil: "",
    maxOccurrences: "",
  });
  const [rooms, setRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (showRecurringModal) {
      console.log("Modal mở → Gọi fetchRooms...");
      fetchRooms()
        .then(rooms => {
          console.log("Rooms loaded:", rooms);
          setRooms(rooms);
        })
        .catch(err => {
          console.error("Lỗi fetch rooms:", err);
          toast.error("Không tải được danh sách phòng!");
        });
    }
  }, [showRecurringModal]);

  const handleRecurringChange = (e) => {
    const { name, value } = e.target;
    setRecurringForm(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateRecurring = async () => {
    const { title, startTime, endTime, roomId, recurrenceType, recurUntil, maxOccurrences } = recurringForm;
    if (!title || !startTime || !endTime || !roomId || !recurUntil) {
      toast.warning("Vui lòng điền đầy đủ các trường bắt buộc!");
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        title: title.trim(),
        description: recurringForm.description?.trim() || "",
        roomId: parseInt(roomId),
        startTime,
        endTime,
        recurrence: recurrenceType,
        recurUntil,
        maxOccurrences: maxOccurrences ? parseInt(maxOccurrences) : null,
      };

      await createRecurringMeeting(payload);
      toast.success("Tạo buổi họp định kỳ thành công!");
      const updated = await getMeetingsByOrganizer(organizerId);
      setMeetings(updated);
      setShowRecurringModal(false);
      setRecurringForm({
        title: "", description: "", startTime: "", endTime: "", roomId: "",
        recurrenceType: "DAILY", recurUntil: "", maxOccurrences: ""
      });
    } catch (error) {
      const msg = error.response?.data?.message || error.message || "Lỗi tạo buổi họp định kỳ!";
      if (msg.includes("daily meeting limit")) {
        toast.error("Bạn đã đạt giới hạn 2 buổi họp/ngày! Vui lòng hủy buổi cũ.");
      } else {
        toast.error(extractQuotedMessage(msg));
      }
      console.error("Lỗi tạo recurring:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDateTimeChange = (field, momentDate) => {
    if (momentDate && momentDate.isValid()) {
      const vnTime = momentDate.tz('Asia/Ho_Chi_Minh');
      setRecurringForm(prev => ({ ...prev, [field]: vnTime.format('YYYY-MM-DDTHH:mm:ss') }));
    } else {
      setRecurringForm(prev => ({ ...prev, [field]: "" }));
    }
  };

  const formatDate = (dateString) => {
    if (dateString) {
      return moment.tz(dateString, 'YYYY-MM-DDTHH:mm:ss', 'Asia/Ho_Chi_Minh');
    }
    return null;
  };

  return (
    <>
      <button 
        className="btn-add-meeting" 
        style={{ background: "linear-gradient(135deg, #7c3aed, #a78bfa)" }}
        onClick={() => setShowRecurringModal(true)}
      >
        <FaRedo /> Create Recurring
      </button>

      {showRecurringModal && (
        <div className="modal-overlay" onClick={() => setShowRecurringModal(false)}>
          <div className="modal-container" onClick={e => e.stopPropagation()}>
            <div className="modal-header" style={{ background: "linear-gradient(135deg, #7c3aed, #a78bfa)" }}>
              <h3><FaRedo /> Create Recurring Meeting</h3>
              <button className="close-btn" onClick={() => setShowRecurringModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="user-form-group">
                <label>Title *</label>
                <input name="title" value={recurringForm.title} onChange={handleRecurringChange} placeholder="Meeting title" />
              </div>
              <div className="user-form-group">
                <label>Description</label>
                <textarea name="description" value={recurringForm.description} onChange={handleRecurringChange} placeholder="Optional" rows="2" />
              </div>
              <div className="user-form-group">
                <label>Room *</label>
                <select name="roomId" value={recurringForm.roomId} onChange={handleRecurringChange}>
                  <option value="">Select room</option>
                  {rooms.length === 0 ? (
                    <option disabled>Loading rooms...</option>
                  ) : (
                    rooms.map(r => (
                      <option key={r.roomId} value={r.roomId}>
                        {r.roomName} ({r.type})
                      </option>
                    ))
                  )}
                </select>
              </div>
              <div className="user-form-group">
                <label>Start time *</label>
                <div className="datetime-picker-container">
                  <Datetime 
                    value={formatDate(recurringForm.startTime)} 
                    onChange={d => handleDateTimeChange("startTime", d)} 
                    dateFormat="DD/MM/YYYY" 
                    timeFormat="HH:mm" 
                    inputProps={{ readOnly: true, placeholder: "Select start time" }} 
                  />
                  <FaCalendarAlt className="input-icon" />
                </div>
              </div>
              <div className="user-form-group">
                <label>End time *</label>
                <div className="datetime-picker-container">
                  <Datetime 
                    value={formatDate(recurringForm.endTime)} 
                    onChange={d => handleDateTimeChange("endTime", d)} 
                    dateFormat="DD/MM/YYYY" 
                    timeFormat="HH:mm" 
                    inputProps={{ readOnly: true, placeholder: "Select end time" }} 
                  />
                  <FaCalendarAlt className="input-icon" />
                </div>
              </div>
              <div className="user-form-group">
                <label>Repeat *</label>
                <select name="recurrenceType" value={recurringForm.recurrenceType} onChange={handleRecurringChange}>
                  <option value="DAILY">Daily</option>
                  <option value="WEEKLY">Weekly</option>
                  <option value="MONTHLY">Monthly</option>
                </select>
              </div>
              <div className="user-form-group">
                <label>Until *</label>
                <div className="datetime-picker-container">
                  <Datetime 
                    value={formatDate(recurringForm.recurUntil)} 
                    onChange={d => handleDateTimeChange("recurUntil", d)} 
                    dateFormat="DD/MM/YYYY" 
                    timeFormat={false} 
                    inputProps={{ readOnly: true, placeholder: "Select end date" }} 
                  />
                  <FaCalendarAlt className="input-icon" />
                </div>
              </div>
              <div className="user-form-group">
                <label>Max occurrences (optional)</label>
                <input 
                  type="number" 
                  name="maxOccurrences" 
                  value={recurringForm.maxOccurrences} 
                  onChange={handleRecurringChange} 
                  min="1" 
                  placeholder="e.g. 10" 
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowRecurringModal(false)}>Cancel</button>
              <button className="btn-save" onClick={handleCreateRecurring} disabled={isLoading}>
                {isLoading ? "Creating..." : "Create Recurring"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default RecurringMeeting;