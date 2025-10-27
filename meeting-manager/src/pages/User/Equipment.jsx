import React, { useState } from "react";
import { FaCalendarAlt, FaVideo, FaTv, FaChalkboard, FaHashtag } from "react-icons/fa";
import Datetime from "react-datetime";
import "react-datetime/css/react-datetime.css";
import moment from "moment";
import "../../assets/styles/UserCSS/AvailableRooms.css";

// ⚙️ Dữ liệu mô phỏng trạng thái thực tế của từng loại thiết bị
const equipmentData = {
  Projector: { total: 7, maintenance: 0, booked: 2 },
  TV: { total: 4, maintenance: 2, booked: 1 },
  Whiteboard: { total: 10, maintenance: 3, booked: 2 },
};

const EquipmentStatus = () => {
  const [form, setForm] = useState({
    startTime: "",
    endTime: "",
  });

  const [selectedEquipments, setSelectedEquipments] = useState([]);
  const [equipmentQuantities, setEquipmentQuantities] = useState({});
  const [showStatusPopup, setShowStatusPopup] = useState(false);
  const [statusList, setStatusList] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 🕒 Format thời gian hiển thị
  const formatDate = (date) =>
    date ? moment(date).format("DD/MM/YYYY HH:mm") : "";

  // ⏰ Thay đổi start/end time
  const handleDateTimeChange = (field, date) => {
    if (moment.isMoment(date)) {
      setForm((prev) => ({
        ...prev,
        [field]: date.format("YYYY-MM-DDTHH:mm:ss"),
      }));
    } else {
      setForm((prev) => ({ ...prev, [field]: "" }));
    }
  };

  // 🎛 Chọn hoặc bỏ chọn thiết bị
  const toggleEquipment = (equipment) => {
    setSelectedEquipments((prev) =>
      prev.includes(equipment)
        ? prev.filter((e) => e !== equipment)
        : [...prev, equipment]
    );
  };

  // 🔢 Thay đổi số lượng thiết bị cần mượn
  const handleQuantityChange = (equipment, value) => {
    const quantity = Math.max(1, parseInt(value) || 1);
    setEquipmentQuantities((prev) => ({ ...prev, [equipment]: quantity }));
  };

  // 🔍 Khi nhấn "Find available rooms"
  const handleFindStatus = async () => {
    if (!form.startTime || !form.endTime) {
      setError("Please select a start and end time!");
      return;
    }
    if (selectedEquipments.length === 0) {
      setError("Please select at least one equipment!");
      return;
    }

    setError("");
    setLoading(true);

    // ⏳ Giả lập gọi API, xử lý trạng thái
    setTimeout(() => {
      const results = {};
      selectedEquipments.forEach((eq) => {
        const { total, maintenance, booked } = equipmentData[eq];
        const available = total - maintenance - booked;
        const requested = equipmentQuantities[eq] || 1;

        // ⚙️ Tính trạng thái tổng hợp
        let status;
        if (requested > available) {
          status = "exceed";
        } else if (available <= 0) {
          status = "unavailable";
        } else {
          status = "ok";
        }

        results[eq] = {
          total,
          maintenance,
          booked,
          available,
          requested,
          status,
        };
      });

      setStatusList(results);
      setShowStatusPopup(true);
      setLoading(false);
    }, 700);
  };

  return (
    <div className="available-rooms-container">
      <h2>Equipment</h2>
      <p>Select time, equipment, and quantity to check availability</p>

      {/* Bộ lọc thời gian */}
      <div className="filter-form">
        <div className="form-row">
          <div className="user-form-group">
            <label>Start time *</label>
            <div className="datetime-picker-container">
              <Datetime
                value={formatDate(form.startTime)}
                onChange={(date) => handleDateTimeChange("startTime", date)}
                dateFormat="DD/MM/YYYY"
                timeFormat="HH:mm"
                inputProps={{ placeholder: "Select start time", readOnly: true }}
                closeOnSelect
              />
              <FaCalendarAlt className="input-icon" />
            </div>
          </div>

          <div className="user-form-group">
            <label>End time *</label>
            <div className="datetime-picker-container">
              <Datetime
                value={formatDate(form.endTime)}
                onChange={(date) => handleDateTimeChange("endTime", date)}
                dateFormat="DD/MM/YYYY"
                timeFormat="HH:mm"
                inputProps={{ placeholder: "Select end time", readOnly: true }}
                closeOnSelect
              />
              <FaCalendarAlt className="input-icon" />
            </div>
          </div>
        </div>

        {/* Chọn thiết bị */}
        <div className="form-row">
          <div className="user-form-group">
            <label>Equipment</label>
            <div className="room-type-selector">
              <button
                type="button"
                className={`room-type-btn ${
                  selectedEquipments.includes("Projector") ? "active" : ""
                }`}
                onClick={() => toggleEquipment("Projector")}
              >
                <FaVideo /> Projector
              </button>
              <button
                type="button"
                className={`room-type-btn ${
                  selectedEquipments.includes("TV") ? "active" : ""
                }`}
                onClick={() => toggleEquipment("TV")}
              >
                <FaTv /> TV
              </button>
              <button
                type="button"
                className={`room-type-btn ${
                  selectedEquipments.includes("Whiteboard") ? "active" : ""
                }`}
                onClick={() => toggleEquipment("Whiteboard")}
              >
                <FaChalkboard /> Whiteboard
              </button>
            </div>
          </div>
        </div>

        {/* Nhập số lượng thiết bị */}
        {selectedEquipments.length > 0 && (
          <div className="form-row">
            {selectedEquipments.map((eq) => (
              <div key={eq} className="user-form-group">
                <label>{eq} quantity</label>
                <div className="input-with-icon">
                  <FaHashtag className="input-icon" />
                  <input
                    type="number"
                    min="1"
                    value={equipmentQuantities[eq] || 1}
                    onChange={(e) => handleQuantityChange(eq, e.target.value)}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        <button className="btn-search" onClick={handleFindStatus} disabled={loading}>
          {loading ? "Checking..." : "Find available rooms"}
        </button>

        {error && <p className="error-message">{error}</p>}
      </div>

      {/* Popup hiển thị trạng thái thiết bị */}
      {showStatusPopup && (
        <div className="dialog-overlay">
          <div className="dialog-box" style={{ maxWidth: "500px" }}>
            <h3>Equipment Status</h3>
            {Object.entries(statusList).map(([eq, info]) => (
              <div key={eq} className="equipment-status-card">
                <h4>{eq}</h4>
                <p>
                  <strong>Total:</strong> {info.total}
                  <br />
                  <strong>Available:</strong> {info.available}
                  <br />
                  <strong>Booked:</strong> {info.booked}
                  <br />
                  <strong>Maintenance:</strong> {info.maintenance}
                  <br />
                  <strong>Requested:</strong> {info.requested}
                </p>

                <p>
                  <strong>Status: </strong>
                  {info.status === "ok" && (
                    <span style={{ color: "green" }}>✅ OK (Can borrow)</span>
                  )}
                  {info.status === "exceed" && (
                    <span style={{ color: "red" }}>
                      ❌ Exceed available amount
                    </span>
                  )}
                  {info.status === "unavailable" && (
                    <span style={{ color: "orange" }}>
                      ⚠️ None available at this time
                    </span>
                  )}
                </p>
                <hr />
              </div>
            ))}
            <div className="dialog-actions">
              <button onClick={() => setShowStatusPopup(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EquipmentStatus;
