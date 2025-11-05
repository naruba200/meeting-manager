import React, { useState } from "react";
import { FaCalendarAlt } from "react-icons/fa";
import Datetime from "react-datetime";
import "react-datetime/css/react-datetime.css";
import moment from "moment";
import "../../assets/styles/UserCSS/Equip.css";

// Import API service
import { getEquipmentAvailability } from "../../services/equipmentApi";

const EquipmentStatus = () => {
  // 🕒 State cho thời gian (sử dụng moment objects để tương thích với react-datetime)
  const [form, setForm] = useState({
    startTime: moment().startOf('day'), 
    endTime: moment().startOf('day'),
  });

  const [statusList, setStatusList] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 🕒 Format thời gian hiển thị
  const formatDate = (date) =>
    date ? date.format("DD/MM/YYYY HH:mm") : "";

  // ⏰ Thay đổi start/end time (giữ nguyên moment object)
  const handleDateTimeChange = (field, date) => {
    if (moment.isMoment(date) && date.isValid()) {
      setForm((prev) => ({ ...prev, [field]: date }));
    } else {
      setForm((prev) => ({ ...prev, [field]: null }));
    }
  };

  // 🔍 Khi nhấn "Lọc" (gọi API thực tế)
  const handleFilterStatus = async () => {
    if (!form.startTime || !form.startTime.isValid()) {
      setError("Vui lòng chọn thời gian bắt đầu hợp lệ!");
      return;
    }
    if (!form.endTime || !form.endTime.isValid()) {
      setError("Vui lòng chọn thời gian kết thúc hợp lệ!");
      return;
    }
    if (form.endTime.isBefore(form.startTime)) {
      setError("Thời gian kết thúc phải sau thời gian bắt đầu!");
      return;
    }

    setError("");
    setLoading(true);
    setStatusList({});  // Clear kết quả cũ

    try {
      const data = await getEquipmentAvailability(form.startTime, form.endTime);
      
      if (data.error) {
        setError(data.error);
        return;
      }

      // Set statusList từ API response (equipments là Map<equipmentId, info>)
      setStatusList(data.equipments || {});
    } catch (err) {
      console.error("API Error:", err);
      if (err.message.includes('401') || err.message.includes('Unauthorized') || err.message.includes('token')) {
        setError("Phiên đăng nhập hết hạn hoặc chưa đăng nhập. Vui lòng đăng nhập lại!");
        localStorage.removeItem('accessToken');  // Clear token invalid
        // Tự động redirect đến trang login (uncomment nếu có route login)
        // window.location.href = '/login';
      } else {
        setError(err.message || "Lỗi kết nối API. Vui lòng thử lại!");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="available-equipment-container">
      <h2>Trạng thái thiết bị</h2>
      <p>Chọn khoảng thời gian để lọc và xem số lượng còn lại của từng thiết bị</p>

      {/* Bộ lọc thời gian */}
      <div className="filter-form">
        <div className="form-row">
          <div className="user-form-group">
            <label>Thời gian bắt đầu *</label>
            <div className="datetime-picker-container">
              <Datetime
                value={form.startTime}
                onChange={(date) => handleDateTimeChange("startTime", date)}
                dateFormat="DD/MM/YYYY"
                timeFormat="HH:mm"
                inputProps={{ placeholder: "Chọn thời gian bắt đầu", readOnly: true }}
                closeOnSelect
              />
              <FaCalendarAlt className="input-icon" />
            </div>
          </div>

          <div className="user-form-group">
            <label>Thời gian kết thúc *</label>
            <div className="datetime-picker-container">
              <Datetime
                value={form.endTime}
                onChange={(date) => handleDateTimeChange("endTime", date)}
                dateFormat="DD/MM/YYYY"
                timeFormat="HH:mm"
                inputProps={{ placeholder: "Chọn thời gian kết thúc", readOnly: true }}
                closeOnSelect
              />
              <FaCalendarAlt className="input-icon" />
            </div>
          </div>
        </div>

        <button 
          className="btn-search" 
          onClick={handleFilterStatus} 
          disabled={loading}
        >
          {loading ? "Đang lọc..." : "Lọc"}
        </button>

        {error && (
          <div className="error-message">
            {error}
            {error.includes('đăng nhập') && (
              <button 
                className="btn-search" 
                onClick={() => window.location.href = '/login'} 
                style={{ marginTop: '10px', padding: '8px 16px', fontSize: '14px' }}
              >
                Đăng nhập lại
              </button>
            )}
          </div>
        )}
      </div>

      {/* Bảng hiển thị danh sách thiết bị và số lượng còn lại */}
      {Object.keys(statusList).length > 0 && (
        <div className="results-section">
          <h3>Kết quả lọc</h3>
          <table className="status-table">
            <thead>
              <tr>
                <th>Tên thiết bị</th>
                <th>Tổng số lượng</th>
                <th>Đang bảo trì</th>
                <th>Đã đặt</th>
                <th>Số lượng còn lại</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(statusList).map(([eqId, info]) => (
                <tr key={eqId}>
                  <td>{info.equipmentName}</td>  {/* Từ API: info.equipmentName */}
                  <td>{info.total}</td>
                  <td>{info.maintenance}</td>
                  <td>{info.booked}</td>
                  <td className={info.remainingQuantity === 0 ? "low-stock" : ""}>
                    {info.remainingQuantity}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default EquipmentStatus;