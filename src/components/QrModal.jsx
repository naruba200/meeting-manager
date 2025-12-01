import React, { useEffect, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import attendanceService from "../services/attendanceService"; // Sửa import: attendanceService (không phải attiendanceService)
import "../assets/styles/UserCSS/MyMeeting.css"; // Giả sử CSS này có style cho modal

export default function QrModal({ meetingId, onClose }) {
  const [qrUrl, setQrUrl] = useState("");
  const [attendees, setAttendees] = useState([]); // Sửa: dùng Attendance entities từ API
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    generateQr();
    fetchAttendees();
  }, [meetingId]); // Thêm dependency meetingId để re-fetch nếu thay đổi

  const generateQr = async () => {
    try {
      setLoading(true);
      const res = await attendanceService.generateQr(meetingId); // Sửa: dùng hàm generateQr từ service
      const qrToken = res.qrToken || res.token; // Lấy token từ response
      const url = `${window.location.origin}/attend/${qrToken}`; // Build URL frontend (không dùng qrUrl từ backend nếu dev/prod khác port)
      setQrUrl(url);
    } catch (err) {
      console.error("Lỗi generate QR:", err);
      alert("Không thể tạo mã QR! Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendees = async () => {
    try {
      const data = await attendanceService.getAttendanceList(meetingId); // Sửa: dùng hàm getAttendanceList từ service
      setAttendees(data || []);
    } catch (err) {
      console.error("Lỗi fetch attendees:", err);
    }
  };

  // Refresh attendees sau khi generate QR (nếu cần real-time, có thể poll hoặc dùng WebSocket)
  useEffect(() => {
    if (qrUrl) {
      const interval = setInterval(fetchAttendees, 5000); // Poll mỗi 5s để update real-time
      return () => clearInterval(interval);
    }
  }, [qrUrl]);

  const copyLink = () => {
    if (qrUrl) {
      navigator.clipboard.writeText(qrUrl).then(() => {
        alert("Đã sao chép liên kết QR!");
      });
    }
  };

  // Close modal nếu click outside
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-container">
        <div className="modal-header">
          <h3>QR Check-in cho Cuộc họp</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="modal-body" style={{ textAlign: "center" }}>
          {loading ? (
            <p>Đang tạo mã QR...</p>
          ) : qrUrl ? (
            <>
              <QRCodeCanvas value={qrUrl} size={220} />
              <p className="mt-2" style={{ wordBreak: "break-all", fontSize: "12px" }}>
                {qrUrl}
              </p>
              <button className="btn-save" onClick={copyLink} style={{ margin: "10px" }}>
                Copy Link
              </button>
              <p style={{ fontSize: "14px", color: "#666" }}>
                Quét QR bằng camera hoặc truy cập link để check-in.
              </p>
            </>
          ) : (
            <p>Không thể tạo mã QR. Vui lòng thử lại.</p>
          )}

          <div className="attend-list mt-4">
            <h4>Danh sách điểm danh ({attendees.length})</h4>
            <ul style={{ textAlign: "left", maxHeight: 200, overflow: "auto" }}>
              {attendees.map((a, i) => (
                <li key={i}>
                  {a.user?.fullName || a.userName || "Unknown"} –{" "}
                  <small>{new Date(a.scannedAt).toLocaleString('vi-VN')}</small>
                </li>
              ))}
              {attendees.length === 0 && <li>Chưa có ai check-in.</li>}
            </ul>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose}>
            Đóng
          </button>
          {qrUrl && (
            <button className="btn-save" onClick={generateQr}>
              Tạo QR mới
            </button>
          )}
        </div>
      </div>
    </div>
  );
}