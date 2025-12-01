import React, { useState, useEffect, useCallback } from "react";
import "../../assets/styles/TKE.css";
import { fetchCancelledMeetingsReport } from "../../services/TKE";

// Charts
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

  // ====================== FETCH API VIA SERVICE ======================
  const fetchReportData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await fetchCancelledMeetingsReport(startDate, endDate);
      console.log("✅ API Data:", data);
      setReportData(data);
      setIsAuthenticated(true);
    } catch (err) {
      console.error("❌ Error fetching data:", err);
      if (err.status === 401) {
        setError("Your session has expired. Please log in again!");
        setIsAuthenticated(false);
      } else if (err.status === 403) {
        setError("You do not have permission to access this report!");
      } else if (err.status === 400) {
        setError("Invalid date parameters!");
      } else {
        setError(err.message || "Failed to load report data.");
      }
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    fetchReportData();
  }, [fetchReportData]);

  const handleReload = () => fetchReportData();
  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  // ====================== CHART DATA ======================
  const getChartData = () => {
    if (!reportData) return [];
    return [
      { name: "Total Meetings", value: reportData.totalMeetings || 0 },
      { name: "Cancelled Meetings", value: reportData.cancelledMeetings || 0 },
    ];
  };

  const getPieChartData = () => {
    if (!reportData) return [];
    const total = reportData.totalMeetings || 1;
    const cancelled = reportData.cancelledMeetings || 0;
    const completed = total - cancelled;
    return [
      { name: "Completed", value: completed },
      { name: "Cancelled", value: cancelled },
    ];
  };

  const COLORS = ["#00C49F", "#FF8042"];

  // ====================== UI RENDER ======================

  if (!isAuthenticated) {
    return (
      <div className="tke-auth-error">
        <div className="auth-error-message">
          <div className="error-icon">⚠️</div>
          <h3>Authentication Error</h3>
          <p>{error}</p>
          <div className="auth-actions">
            <button className="btn-primary" onClick={() => (window.location.href = "/login")}>
              Log In Again
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
        <p>Loading report data...</p>
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
              🔄 Retry
            </button>
            <button className="btn-secondary" onClick={handleLogout}>
              🚪 Logout
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
          <p>No report data available!</p>
          <button className="btn-primary" onClick={handleReload}>
            Reload
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
            <h1>📊 Cancelled Meetings Report</h1>
            <p>Analyze data of meetings that were cancelled in the system</p>
          </div>
          <div className="header-actions">
            <button className="btn-secondary" onClick={handleReload}>
              🔄 Reload
            </button>
          </div>
        </div>
      </div>

      {/* Date Filters */}
      <div className="filter-section">
        <div className="filter-content">
          <div className="filter-group">
            <label className="filter-label">From date:</label>
            <input
              type="date"
              className="filter-input"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="filter-group">
            <label className="filter-label">To date:</label>
            <input
              type="date"
              className="filter-input"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <button className="btn-primary filter-btn" onClick={handleReload}>
            Apply
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card total-meetings">
          <div className="kpi-icon">📅</div>
          <div className="kpi-content">
            <h3>Total Meetings</h3>
            <p className="kpi-value">{reportData.totalMeetings || 0}</p>
          </div>
        </div>
        <div className="kpi-card cancelled-meetings">
          <div className="kpi-icon">❌</div>
          <div className="kpi-content">
            <h3>Cancelled Meetings</h3>
            <p className="kpi-value">{reportData.cancelledMeetings || 0}</p>
          </div>
        </div>
        <div className="kpi-card cancellation-rate">
          <div className="kpi-icon">📊</div>
          <div className="kpi-content">
            <h3>Cancellation Rate</h3>
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
            <h3>Success Rate</h3>
            <p className="kpi-value">
              {reportData.cancellationRate
                ? (100 - reportData.cancellationRate).toFixed(2)
                : 100}
              %
            </p>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="charts-section">
        <div className="chart-container">
          <div className="chart-card">
            <h3>Meeting Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={getChartData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#8884d8" name="Count" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-container">
          <div className="chart-card">
            <h3>Completion Rate</h3>
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

      {/* Cancelled Meeting Table */}
      <div className="table-section">
        <div className="table-header">
          <h3>Cancelled Meeting Details</h3>
          <span className="table-count">
            ({reportData.detailedCancelledMeetings?.length || 0} meetings)
          </span>
        </div>

        <div className="tke-table-container">
          {reportData.detailedCancelledMeetings?.length > 0 ? (
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Title</th>
                  <th>Room</th>
                  <th>Organizer</th>
                  <th>Start</th>
                  <th>End</th>
                  <th>Created At</th>
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
              <p>No cancelled meetings found in this period</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TKE;
