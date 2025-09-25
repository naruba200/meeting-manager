import React, { useState, useEffect, useMemo } from 'react';
import CreateUserForm from './CreateUserForm';
import UserModal from '../components/UserModal.jsx';
import '../assets/styles/UserList.css';

const UserList = () => {
  const [isMainSidebarOpen, setIsMainSidebarOpen] = useState(true);
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);
  const [touchStartX, setTouchStartX] = useState(null);
  const [touchCurrentX, setTouchCurrentX] = useState(null);

  // search & sort
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('lastUpdatedDesc');

  // dropdown menu user
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Modal state
  const [editUser, setEditUser] = useState(null);
  const [deleteUser, setDeleteUser] = useState(null);

  // Demo data
  const [users, setUsers] = useState([
    { userId: 1147, username: "IsabellaW", email: "abc@gmail.com", fullName: "Bùi Văn A", phone: "012345678", department: "IT", position: "Staff", status: 1, date: "Jul 21" },
    { userId: 1148, username: "IsabellaW2", email: "abc2@gmail.com", fullName: "Bùi Văn B", phone: "012345678", department: "IT", position: "Staff", status: 1, date: "Jul 21" },
    { userId: 1129, username: "MatthewM", email: "abc3@gmail.com", fullName: "Bùi Văn C", phone: "012345678", department: "IT", position: "Staff", status: 0, date: "Jul 21" },
    { userId: 9626, username: "BrianBaker", email: "abc4@gmail.com", fullName: "Bùi Văn D", phone: "012345678", department: "IT", position: "Staff", status: 1, date: "Jul 19" },
    { userId: 963, username: "BrianBaker2", email: "abc5@gmail.com", fullName: "Bùi Văn E", phone: "012345678", department: "IT", position: "Manager", status: 1, date: "Jul 20" },
    { userId: 964, username: "JohnDoe", email: "john.doe@gmail.com", fullName: "Nguyễn Văn F", phone: "0987654321", department: "HR", position: "Manager", status: 1, date: "Jul 18" },
    { userId: 965, username: "JaneSmith", email: "jane.smith@gmail.com", fullName: "Trần Thị G", phone: "0981234567", department: "Finance", position: "Staff", status: 0, date: "Jul 17" },
    { userId: 966, username: "AliceWong", email: "alice.wong@gmail.com", fullName: "Lê Văn H", phone: "0976543210", department: "Marketing", position: "Staff", status: 1, date: "Jul 16" },
    { userId: 967, username: "BobJohnson", email: "bob.johnson@gmail.com", fullName: "Phạm Văn I", phone: "0965432109", department: "IT", position: "Staff", status: 1, date: "Jul 15" },
    { userId: 968, username: "CarolWhite", email: "carol.white@gmail.com", fullName: "Hoàng Thị K", phone: "0954321098", department: "IT", position: "Manager", status: 1, date: "Jul 14" },
  ]);

  // --- Swipe sidebar ---
  const handleTouchStart = (e) => {
    setTouchStartX(e.touches[0].clientX);
    setTouchCurrentX(e.touches[0].clientX);
  };
  const handleTouchMove = (e) => setTouchCurrentX(e.touches[0].clientX);
  const handleTouchEnd = () => {
    if (touchStartX !== null && touchCurrentX !== null) {
      const deltaX = touchCurrentX - touchStartX;
      const swipeThreshold = 100;
      if (deltaX > swipeThreshold) setIsMainSidebarOpen(true);
      else if (deltaX < -swipeThreshold) setIsMainSidebarOpen(false);
    }
    setTouchStartX(null);
    setTouchCurrentX(null);
  };

  useEffect(() => {
    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleTouchEnd);
    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [touchStartX, touchCurrentX]);

  // đóng menu khi click ngoài
  useEffect(() => {
    const closeMenu = (e) => {
      if (!e.target.closest('.user-menu-wrapper')) setShowUserMenu(false);
    };
    document.addEventListener('click', closeMenu);
    return () => document.removeEventListener('click', closeMenu);
  }, []);

  const parseDateFromString = (dateStr) => {
    if (!dateStr) return new Date(0);
    const year = new Date().getFullYear();
    const maybe = new Date(`${dateStr} ${year}`);
    if (!isNaN(maybe)) return maybe;
    const t = Date.parse(dateStr);
    return isNaN(t) ? new Date(0) : new Date(t);
  };

  const visibleUsers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    let list = users.slice();
    if (q) {
      list = list.filter(u =>
        (u.username || '').toLowerCase().includes(q) ||
        (u.fullName || '').toLowerCase().includes(q) ||
        (u.email || '').toLowerCase().includes(q) ||
        String(u.userId).includes(q)
      );
    }
    list.sort((a, b) => {
      switch (sortOption) {
        case 'nameAsc':
          return a.username.localeCompare(b.username);
        case 'nameDesc':
          return b.username.localeCompare(a.username);
        case 'oldestFirst':
          return parseDateFromString(a.date) - parseDateFromString(b.date);
        case 'newestFirst':
        case 'lastUpdatedDesc':
        default:
          return parseDateFromString(b.date) - parseDateFromString(a.date);
        case 'userIdDesc':
          return b.userId - a.userId;
      }
    });
    return list;
  }, [users, searchQuery, sortOption]);

  // === Mở modal chỉnh sửa / xóa ===
  const handleEditUser = (userId) => {
    const user = users.find(u => u.userId === userId);
    setEditUser(user);
  };
  const handleDeleteUser = (userId) => {
    const user = users.find(u => u.userId === userId);
    setDeleteUser(user);
  };

  return (
    <div className="app-container">
      <nav className="top-navbar">
        <span className="nav-icon">✉︎</span>
        {/* Icon user + menu dropdown */}
        <div className="user-menu-wrapper" style={{ position: 'relative' }}>
          <span
            className="nav-icon"
            style={{ cursor: 'pointer' }}
            onClick={() => setShowUserMenu((prev) => !prev)}
          >
            🜲
          </span>
          {showUserMenu && (
            <div className="user-menu">
              <div className="user-menu-item">Thông tin tài khoản</div>
              <div className="user-menu-item">Đăng xuất</div>
            </div>
          )}
        </div>
      </nav>

      <aside className={`main-sidebar ${isMainSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <span>Views</span>
          <span className="menu-toggle" onClick={() => setIsMainSidebarOpen(!isMainSidebarOpen)}>≡</span>
        </div>
        <nav className="sidebar-nav">
          <div className="nav-item"><span className="nav-icon">🏠︎</span> Home</div>
          <div className="nav-item active"><span className="nav-icon">☺</span> User Management</div>
          <div className="nav-item"><span className="nav-icon">⏻</span> Settings</div>
        </nav>
      </aside>

      {isCreateFormOpen && <CreateUserForm onClose={() => setIsCreateFormOpen(false)} />}

      <main className={`main-content ${!isMainSidebarOpen ? 'full' : ''}`}>
        <header className="header">
          <div className="header-actions">
            <input
              type="text"
              placeholder="Search users (name, username, email, id)..."
              className="search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />

            <select
              className="sort-select"
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
            >
              <option value="lastUpdatedDesc">Sort: Last updated ↓</option>
              <option value="newestFirst">Sort: Newest first</option>
              <option value="oldestFirst">Sort: Oldest first</option>
              <option value="nameAsc">Sort: Name A-Z</option>
              <option value="nameDesc">Sort: Name Z-A</option>
              <option value="userIdDesc">Sort: ID: High → Low</option>
            </select>

            <button className="filter-button">Filter Options</button>
            <button
              className="add-user-button"
              onClick={() => setIsCreateFormOpen(true)}
            >
              ✚ Add User
            </button>
          </div>
        </header>

        <section className="content">
          <h1 className="page-title">USER LIST</h1>

          <div className="table-container">
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
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {visibleUsers.map((user) => (
                  <tr key={user.userId}>
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
                    <td>
                      <span style={{
                        background: user.status === 1 ? '#f0fff0' : '#fff0f0',
                        color: user.status === 1 ? '#27ae60' : '#e74c3c',
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '600'
                      }}>
                        {user.status === 1 ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ color: '#95a5a6', fontSize: '13px' }}>{user.date}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="edit-button"
                          onClick={() => handleEditUser(user.userId)}
                          title="Edit user"
                        >
                          ✎
                        </button>
                        <button
                          className="delete-button"
                          onClick={() => handleDeleteUser(user.userId)}
                          title="Delete user"
                        >
                          ✗
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {visibleUsers.length === 0 && (
                  <tr>
                    <td colSpan={10} style={{ textAlign: 'center', padding: '24px', color: '#718096' }}>
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {/* === Modal Edit User === */}
      {editUser && (
        <UserModal title="Chỉnh sửa người dùng" onClose={() => setEditUser(null)}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              // TODO: lưu dữ liệu edit
              alert('Đã lưu chỉnh sửa cho ' + editUser.fullName);
              setEditUser(null);
            }}
          >
            <label>Họ và tên:</label>
            <input defaultValue={editUser.fullName} style={{width:'100%',margin:'6px 0'}} />
            <label>Email:</label>
            <input defaultValue={editUser.email} style={{width:'100%',margin:'6px 0'}} />
            <button type="submit" style={{marginTop:'10px'}}>Lưu</button>
          </form>
        </UserModal>
      )}

      {/* === Modal Delete Confirm === */}
      {deleteUser && (
        <UserModal title="Xác nhận xóa" onClose={() => setDeleteUser(null)}>
          <p>Bạn chắc chắn muốn xóa <b>{deleteUser.fullName}</b>?</p>
          <div style={{display:'flex', justifyContent:'flex-end', gap:'10px', marginTop:'15px'}}>
            <button onClick={() => setDeleteUser(null)}>Hủy</button>
            <button
              style={{background:'#e74c3c', color:'#fff'}}
              onClick={() => {
                setUsers(prev => prev.filter(u => u.userId !== deleteUser.userId));
                setDeleteUser(null);
              }}
            >
              Xóa
            </button>
          </div>
        </UserModal>
      )}
    </div>
  );
};

export default UserList;
