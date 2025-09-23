import React, { useState } from 'react';
import '../assets/styles/UserList.css';

const UserList = () => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMainSidebarOpen, setIsMainSidebarOpen] = useState(true);
  
  const users = [
    { userId: "#1147", username: "IsabellaW", email: "abc@gmail.com", fullName: "Bùi Văn A", phone: "012345678", department: "IT", position: "Staff", date: "Jul 21" },
    { userId: "#1147", username: "IsabellaW", email: "abc@gmail.com", fullName: "Bùi Văn B", phone: "012345678", department: "IT", position: "Staff", date: "Jul 21" },
    { userId: "#1129", username: "MatthewM", email: "abc@gmail.com", fullName: "Bùi Văn C", phone: "012345678", department: "IT", position: "Staff", date: "Jul 21" },
    { userId: "#9626", username: "BrianBaker", email: "abc@gmail.com", fullName: "Bùi Văn D", phone: "012345678", department: "IT", position: "Staff", date: "Jul 19" },
    { userId: "#963", username: "BrianBaker", email: "abc@gmail.com", fullName: "Bùi Văn E", phone: "012345678", department: "IT", position: "Manager", date: "Jul 20" },
  ];

  return (
    <div className="app-container">
      <nav className="top-navbar">
        <span className="nav-icon">🔔</span>
        <span className="nav-icon">👤</span>
      </nav>
      
      <aside className={`main-sidebar ${isMainSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <span>Views</span>
          <span className="menu-toggle" onClick={() => setIsMainSidebarOpen(!isMainSidebarOpen)}>≡</span>
        </div>
        <nav className="sidebar-nav">
          <div className="nav-item">
            <span className="nav-icon">🏠</span> Home
          </div>
          <div
            className={`nav-item ${isUserMenuOpen ? 'active' : ''}`}
            onClick={() => setIsUserMenuOpen(true)}
          >
            <span className="nav-icon">👤</span> User Management
          </div>
          <div className="nav-item">
            <span className="nav-icon">⚙️</span> Settings
          </div>
        </nav>
      </aside>
      
      {isUserMenuOpen && (
        <aside className="user-sidebar open">
          <nav className="sidebar-nav">
            <div className="nav-item view-item" onClick={() => setIsUserMenuOpen(false)}>
              <span className="view-text">User Management</span>
              <span className="nav-icon close-icon">×</span>
            </div>
            <hr />
            <div className="nav-item selected">
              <span className="nav-icon">📋</span> User List
            </div>
            <div className="nav-item">
              <span className="nav-icon">➕</span> Create
            </div>
            <div className="nav-item">
              <span className="nav-icon">✏️</span> Edit
            </div>
            <div className="nav-item">
              <span className="nav-icon">🗑️</span> Delete
            </div>
          </nav>
        </aside>
      )}
      
      <main className="main-content">
        <header className="header">
          <div className="header-actions">
            <input type="text" placeholder="Search users..." className="search-input" />
            <select className="sort-select">
              <option>Sort: Last updated ↓</option>
              <option>Sort: Name A-Z</option>
              <option>Sort: Name Z-A</option>
              <option>Sort: Newest first</option>
            </select>
            <button className="filter-button">Filter Options</button>
          </div>
        </header>
        
        <section className="content">
          <h1 className="page-title">USER LIST</h1>
          <table className="user-table">
            <thead>
              <tr>
                <th>UserID</th>
                <th>UserName</th>
                <th>Email</th>
                <th>Full Name</th>
                <th>Phone</th>
                <th>Department</th>
                <th>Position</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, index) => (
                <tr key={index}>
                  <td style={{ fontWeight: '600', color: '#3498db' }}>{user.userId}</td>
                  <td style={{ fontWeight: '500' }}>{user.username}</td>
                  <td style={{ color: '#7f8c8d' }}>{user.email}</td>
                  <td style={{ fontWeight: '500' }}>{user.fullName}</td>
                  <td style={{ color: '#7f8c8d' }}>{user.phone}</td>
                  <td>
                    <span style={{
                      background: '#e8f4fd',
                      color: '#2980b9',
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '600'
                    }}>
                      {user.department}
                    </span>
                  </td>
                  <td>
                    <span style={{
                      background: user.position === 'Manager' ? '#fff0f0' : '#f0fff0',
                      color: user.position === 'Manager' ? '#e74c3c' : '#27ae60',
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '600'
                    }}>
                      {user.position}
                    </span>
                  </td>
                  <td style={{ color: '#95a5a6', fontSize: '13px' }}>{user.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </main>
    </div>
  );
};

export default UserList;