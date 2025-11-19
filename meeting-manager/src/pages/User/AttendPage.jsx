import React, { useState } from "react";
import { useParams } from "react-router-dom";
import attendanceService from "../../services/attendanceService";

export default function AttendPage() {
  const { token } = useParams();
  const [message, setMessage] = useState("");
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleCheckIn = async () => {
    if (loading) return;
    setLoading(true);
    setMessage(""); // Clear previous message
    try {
      const res = await attendanceService.scan(token);
      setMessage(res.message || "check-in successful!");
      setTotal(res.total || 0);
    } catch (err) {
      setMessage(err.message || "Error when checking in! Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "80px", padding: "20px" }}>
      <h2>Điểm danh cuộc họp</h2>
      <p>Token: <b>{token}</b></p>
      <button 
        className="btn-save" 
        onClick={handleCheckIn}
        disabled={loading}
        style={{ opacity: loading ? 0.6 : 1 }}
      >
        {loading ? "Processing..." : "Attendance"}
      </button>
      {message && (
        <p style={{ 
          marginTop: 20, 
          padding: "10px", 
          borderRadius: "5px",
          backgroundColor: message.includes("Success") ? "#d4edda" : "#f8d7da",
          color: message.includes("Success") ? "#155724" : "#721c24"
        }}>
          {message}
        </p>
      )}
      {total > 0 && <p>Total number of people who have checked in: {total}</p>}
      <p style={{ fontSize: "12px", color: "#666", marginTop: "20px" }}>
       Make sure you are logged in to successfully check in.
      </p>
    </div>
  );
}