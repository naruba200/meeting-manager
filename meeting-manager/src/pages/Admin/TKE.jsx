import React, { useState, useEffect } from "react";
import "../../assets/styles/TKE.css";
import { fetchCancelledMeetingsReport } from "../../services/TKE";

// Biểu đồ
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell
} from "recharts";

const TKE = () => {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState("2025-10-01");
  const [endDate, setEndDate] = useState("2025-10-31");
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  // ====================== GỌI API QUA SERVICE ======================
  const fetchReportData = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await fetchCancelledMeetingsReport(startDate, endDate);
      console.log("✅ API Data:", data);
      setReportData(data);
      setIsAuthenticated(true);
    } catch (err) {
      console.error("❌ Lỗi khi tải dữ liệu:", err);
      if (err.status === 401) {
        setError("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!");
        setIsAuthenticated(false);
      } else if (err.status === 403) {
        setError("Bạn không có quyền truy cập báo cáo này!");
      } else if (err.status === 400) {
        setError("Tham số ngày không hợp lệ!");
      } else {
        setError(err.message || "Không thể tải dữ liệu báo cáo.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, [startDate, endDate]);

  const handleReload = () => fetchReportData();
  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  // ====================== DỮ LIỆU CHO BIỂU ĐỒ ======================
  const getChartData = () => {
    if (!reportData) return [];
    return [
      { name: "Tổng cuộc họp", value: reportData.totalMeetings || 0 },
      { name: "Cuộc họp bị hủy", value: reportData.cancelledMeetings || 0 },
    ];
  };

  const getPieChartData = () => {
    if (!reportData) return [];
    const total = reportData.totalMeetings || 1;
    const cancelled = reportData.cancelledMeetings || 0;
    const completed = total - cancelled;
    return [
      { name: "Đã hoàn thành", value: completed },
      { name: "Bị hủy", value: cancelled },
    ];
  };

  const COLORS = ["#00C49F", "#FF8042"];

  // ====================== GIAO DIỆN ======================

  if (!isAuthenticated) {
    return (
      <div className="tke-auth-error">
        <div className="auth-error-message">
          <div className="error-icon">⚠️</div>
          <h3>Lỗi xác thực</h3>
          <p>{error}</p>
          <div className="auth-actions">
            <button className="btn-primary" onClick={() => (window.location.href = "/login")}>
              Đăng nhập lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="tke-loading">
        <div className="loading-spinner"></div>
        <p>Đang tải dữ liệu báo cáo...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="tke-error">
        <div className="error-content">
          <div className="error-icon">❌</div>
          <p>{error}</p>
          <div className="error-actions">
            <button className="btn-primary" onClick={handleReload}>
              🔄 Thử lại
            </button>
            <button className="btn-secondary" onClick={handleLogout}>
              🚪 Đăng xuất
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="tke-no-data">
        <div className="no-data-content">
          <div className="no-data-icon">📊</div>
          <p>Không có dữ liệu báo cáo!</p>
          <button className="btn-primary" onClick={handleReload}>
            Tải lại
          </button>
        </div>
      </div>
    );
  }

  // ====================== MAIN DASHBOARD ======================

  return (
    <div className="tke-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <div className="header-title">
            <h1>📊 Báo cáo cuộc họp bị hủy</h1>
            <p>Phân tích dữ liệu các cuộc họp bị hủy trong hệ thống</p>
          </div>
          <div className="header-actions">
            <button className="btn-secondary" onClick={handleReload}>
              🔄 Tải lại
            </button>
          </div>
        </div>
      </div>

      {/* Bộ lọc thời gian */}
      <div className="filter-section">
        <div className="filter-content">
          <div className="filter-group">
            <label className="filter-label">Từ ngày:</label>
            <input
              type="date"
              className="filter-input"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="filter-group">
            <label className="filter-label">Đến ngày:</label>
            <input
              type="date"
              className="filter-input"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <button className="btn-primary filter-btn" onClick={handleReload}>
            Áp dụng
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card total-meetings">
          <div className="kpi-icon">📅</div>
          <div className="kpi-content">
            <h3>Tổng cuộc họp</h3>
            <p className="kpi-value">{reportData.totalMeetings || 0}</p>
          </div>
        </div>
        <div className="kpi-card cancelled-meetings">
          <div className="kpi-icon">❌</div>
          <div className="kpi-content">
            <h3>Cuộc họp bị hủy</h3>
            <p className="kpi-value">{reportData.cancelledMeetings || 0}</p>
          </div>
        </div>
        <div className="kpi-card cancellation-rate">
          <div className="kpi-icon">📊</div>
          <div className="kpi-content">
            <h3>Tỷ lệ hủy</h3>
            <p className="kpi-value">
              {reportData.cancellationRate
                ? reportData.cancellationRate.toFixed(2)
                : 0}
              %
            </p>
          </div>
        </div>
        <div className="kpi-card success-rate">
          <div className="kpi-icon">✅</div>
          <div className="kpi-content">
            <h3>Tỷ lệ thành công</h3>
            <p className="kpi-value">
              {reportData.cancellationRate
                ? (100 - reportData.cancellationRate).toFixed(2)
                : 100}
              %
            </p>
          </div>
        </div>
      </div>

      {/* Biểu đồ */}
      <div className="charts-section">
        <div className="chart-container">
          <div className="chart-card">
            <h3>Phân bố cuộc họp</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={getChartData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#8884d8" name="Số lượng" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-container">
          <div className="chart-card">
            <h3>Tỷ lệ hoàn thành</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={getPieChartData()}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {getPieChartData().map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bảng chi tiết */}
      <div className="table-section">
        <div className="table-header">
          <h3>Chi tiết cuộc họp bị hủy</h3>
          <span className="table-count">
            ({reportData.detailedCancelledMeetings?.length || 0} cuộc họp)
          </span>
        </div>

        <div className="table-container">
          {reportData.detailedCancelledMeetings?.length > 0 ? (
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Tiêu đề</th>
                  <th>Phòng</th>
                  <th>Người tổ chức</th>
                  <th>Bắt đầu</th>
                  <th>Kết thúc</th>
                  <th>Ngày tạo</th>
                </tr>
              </thead>
              <tbody>
                {reportData.detailedCancelledMeetings.map((m, index) => (
                  <tr
                    key={m.meetingId}
                    className={index % 2 === 0 ? "even" : "odd"}
                  >
                    <td>{m.meetingId}</td>
                    <td>{m.title}</td>
                    <td>{m.roomName}</td>
                    <td>{m.organizerName}</td>
                    <td>{m.scheduledStartTime}</td>
                    <td>{m.scheduledEndTime}</td>
                    <td>{m.createdAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="no-data-message">
              <div className="no-data-icon">📭</div>
              <p>Không có cuộc họp bị hủy trong khoảng thời gian này</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TKE;
