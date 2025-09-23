// src/components/UserList.js
import React from 'react';
import { useState } from 'react';
import '../assets/styles/UserList.css';

const UserList = () => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
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
        <span className="nav-icon">🔔</span> {/* Notification icon */}
        <span className="nav-icon">👤</span> {/* Image/icon placeholder */}
      </nav>
      <aside className="main-sidebar">
        <div className="sidebar-header">
          <span>Views</span>
          <span className="menu-toggle">≡</span>
        </div>
        <nav className="sidebar-nav">
          <div className="nav-item"><span className="nav-icon">🏠</span> Home</div>
          <div 
            className={`nav-item ${isUserMenuOpen ? 'active' : ''}`} 
            onClick={() => !isUserMenuOpen && setIsUserMenuOpen(true)}
          >
            <span className="nav-icon">👤</span> User Management
          </div>
          <div className="nav-item"><span className="nav-icon">⚙️</span> Settings</div>
        </nav>
      </aside>
      {!isUserMenuOpen && (
        <button className="toggle-button" onClick={() => setIsUserMenuOpen(true)}>
          <span className="nav-icon">>></span>
        </button>
      )}
      {isUserMenuOpen && (
        <aside className="user-sidebar">
          <nav className="sidebar-nav">
            <div className="nav-item view-item" onClick={() => setIsUserMenuOpen(false)}>
              <span className="view-text">View</span>
              <span className="nav-icon close-icon">❌</span>
            </div>
            <hr />
            <div className="nav-item selected"><span className="nav-icon">📋</span> User List</div>
            <div className="nav-item"><span className="nav-icon">➕</span> Create</div>
            <div className="nav-item"><span className="nav-icon">✏️</span> Edit</div>
            <div className="nav-item"><span className="nav-icon">🗑️</span> Delete</div>
          </nav>
        </aside>
      )}
      <main className="main-content">
        <header className="header">
          <div className="header-actions">
            <input type="text" placeholder="Search..." className="search-input" />
            <select className="sort-select">
              <option>Sort: Last updated ↓</option>
            </select>
            <button className="filter-button">Filter</button>
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
                  <td>{user.userId}</td>
                  <td>{user.username}</td>
                  <td>{user.email}</td>
                  <td>{user.fullName}</td>
                  <td>{user.phone}</td>
                  <td>{user.department}</td>
                  <td>{user.position}</td>
                  <td>{user.date}</td>
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