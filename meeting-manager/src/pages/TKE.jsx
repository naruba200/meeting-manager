import React, { useState } from 'react';
import { Chart as ChartJS, ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import '../assets/styles/TKE.css';

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const TKE = () => {
  const [filter, setFilter] = useState('all');

  const mockData = {
    totalCanceled: 150,
    cancelRate: 25,
    wastedHours: 300,
    cancelTrend: {
      labels: ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6'],
      data: [20, 30, 25, 40, 15, 20],
    },
    cancelReasons: {
      labels: ['Sức khỏe', 'Xung đột lịch', 'Khác'],
      data: [40, 30, 30],
    },
    meetingDetails: [
      { id: 1, date: '2025-10-01', reason: 'Xung đột lịch', resource: 'Phòng A' },
      { id: 2, date: '2025-10-02', reason: 'Sức khỏe', resource: 'Phòng B' },
      { id: 3, date: '2025-10-03', reason: 'Khác', resource: 'Phòng C' },
    ],
  };

  const barData = {
    labels: mockData.cancelTrend.labels,
    datasets: [
      {
        label: 'Số cuộc họp bị hủy',
        data: mockData.cancelTrend.data,
        backgroundColor: '#4f46e5',
        borderColor: '#4f46e5',
        borderWidth: 0,
        borderRadius: 6,
        barPercentage: 0.6,
      },
    ],
  };

  const pieData = {
    labels: mockData.cancelReasons.labels,
    datasets: [
      {
        data: mockData.cancelReasons.data,
        backgroundColor: ['#ef4444', '#f59e0b', '#10b981'],
        borderColor: '#ffffff',
        borderWidth: 3,
        hoverOffset: 8,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle',
          font: {
            size: 12,
            family: "'Inter', sans-serif"
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#1f2937',
        bodyColor: '#1f2937',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        cornerRadius: 8,
        padding: 12,
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      }
    },
  };

  const barOptions = {
    ...chartOptions,
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(243, 244, 246, 0.8)',
        },
        ticks: {
          font: {
            size: 11,
          },
          color: '#6b7280'
        }
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 11,
          },
          color: '#6b7280'
        }
      },
    },
  };

  const filteredMeetings = mockData.meetingDetails.filter((meeting) => {
    if (filter === 'all') return true;
    return meeting.date.includes(filter);
  });

  return (
    <div className="tke-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <h1 className="dashboard-title">Thống kê cuộc họp bị hủy</h1>
          <p className="dashboard-subtitle">Phân tích và theo dõi các cuộc họp bị hủy trong hệ thống</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-header">
            <div className="kpi-icon red">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M6 2L3 6V20C3 21.1 3.9 22 5 22H19C20.1 22 21 21.1 21 20V6L18 2H6Z" stroke="currentColor" strokeWidth="2"/>
                <path d="M3 6H21" stroke="currentColor" strokeWidth="2"/>
                <path d="M16 10C16 11.66 14.66 13 13 13C11.34 13 10 11.66 10 10" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
            <div className="kpi-trend positive">+5%</div>
          </div>
          <div className="kpi-content">
            <h3 className="kpi-label">Tổng cuộc họp bị hủy</h3>
            <p className="kpi-value">{mockData.totalCanceled}</p>
            <span className="kpi-description">+5% so với tháng trước</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <div className="kpi-icon orange">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M10.29 3.86L1.82 18C1.13 19.2 2.04 20.67 3.53 20.67H20.47C21.96 20.67 22.87 19.2 22.18 18L13.71 3.86C13.03 2.71 11.97 2.71 10.29 3.86Z" stroke="currentColor" strokeWidth="2"/>
                <path d="M12 9V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M12 17H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <div className="kpi-trend negative">-2%</div>
          </div>
          <div className="kpi-content">
            <h3 className="kpi-label">Tỷ lệ hủy</h3>
            <p className="kpi-value">{mockData.cancelRate}%</p>
            <span className="kpi-description">-2% so với tháng trước</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <div className="kpi-icon blue">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
                <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <div className="kpi-trend neutral">~13</div>
          </div>
          <div className="kpi-content">
            <h3 className="kpi-label">Thời gian lãng phí</h3>
            <p className="kpi-value">{mockData.wastedHours} giờ</p>
            <span className="kpi-description">~{Math.round(mockData.wastedHours/24)} ngày</span>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="charts-section">
        <div className="chart-card">
          <div className="chart-header">
            <h3 className="chart-title">Xu hướng hủy theo tháng</h3>
            <div className="chart-actions">
              <button className="chart-btn active">Tháng</button>
              <button className="chart-btn">Quý</button>
              <button className="chart-btn">Năm</button>
            </div>
          </div>
          <div className="chart-container">
            <Bar data={barData} options={barOptions} />
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-header">
            <h3 className="chart-title">Phân bố nguyên nhân hủy</h3>
            <div className="chart-actions">
              <button className="chart-btn active">Tất cả</button>
              <button className="chart-btn">Top 3</button>
            </div>
          </div>
          <div className="chart-container">
            <Pie data={pieData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="table-section">
        <div className="table-card">
          <div className="table-header">
            <h3 className="table-title">Chi tiết cuộc họp bị hủy</h3>
            <div className="table-actions">
              <select 
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="filter-select"
              >
                <option value="all">Tất cả</option>
                <option value="2025-10-01">01/10/2025</option>
                <option value="2025-10-02">02/10/2025</option>
                <option value="2025-10-03">03/10/2025</option>
              </select>
              <button className="export-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2"/>
                  <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2"/>
                  <path d="M16 13H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M16 17H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M10 9H9H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                Xuất Excel
              </button>
            </div>
          </div>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Ngày</th>
                  <th>Nguyên nhân</th>
                  <th>Tài nguyên</th>
                </tr>
              </thead>
              <tbody>
                {filteredMeetings.map((meeting) => (
                  <tr key={meeting.id}>
                    <td className="id-cell">#{meeting.id}</td>
                    <td className="date-cell">{meeting.date}</td>
                    <td>
                      <span className={`reason-tag reason-${meeting.reason === 'Sức khỏe' ? 'health' : meeting.reason === 'Xung đột lịch' ? 'schedule' : 'other'}`}>
                        {meeting.reason}
                      </span>
                    </td>
                    <td className="resource-cell">{meeting.resource}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TKE;