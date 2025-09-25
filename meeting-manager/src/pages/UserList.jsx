import React, { useState, useEffect, useMemo } from 'react';
import CreateUserForm from './CreateUserForm';
import UserModal from '../components/UserModal.jsx';
import { getAllUsers } from '../services/userService';
import '../assets/styles/UserList.css';

const UserList = () => {
  const [isMainSidebarOpen, setIsMainSidebarOpen] = useState(true);
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);
  const [touchStartX, setTouchStartX] = useState(null);
  const [touchCurrentX, setTouchCurrentX] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('lastUpdatedDesc');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [deleteUser, setDeleteUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);

  // Fetch users from API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await getAllUsers();
        console.log('API response:', response); // Debug response
        if (response?.content) {
          setUsers(response.content);
        } else {
          setError('Dữ liệu từ API không đúng định dạng.');
        }
      } catch (error) {
        console.error('Error fetching users:', error.response?.data || error.message);
        const errorMessage = error.response?.status === 401
          ? 'Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.'
          : 'Không thể tải danh sách người dùng. Vui lòng kiểm tra kết nối.';
        setError(errorMessage);
      }
    };
    fetchUsers();
  }, []);

  // Swipe sidebar
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

  // Close user menu when clicking outside
  useEffect(() => {
    const closeMenu = (e) => {
      if (!e.target.closest('.user-menu-wrapper')) setShowUserMenu(false);
    };
    document.addEventListener('click', closeMenu);
    return () => document.removeEventListener('click', closeMenu);
  }, []);

  // Parse date from API format (YYYY-MM-DDTHH:mm:ss)
  const parseDateFromString = (dateStr) => {
    if (!dateStr) return new Date(0);
    const parsedDate = new Date(dateStr);
    return isNaN(parsedDate) ? new Date(0) : parsedDate;
  };

  // Format date for display (e.g., "Jul 21")
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
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
          return parseDateFromString(a.updatedAt || a.createdAt) - parseDateFromString(b.updatedAt || b.createdAt);
        case 'newestFirst':
        case 'lastUpdatedDesc':
        default:
          return parseDateFromString(b.updatedAt || b.createdAt) - parseDateFromString(a.updatedAt || a.createdAt);
        case 'userIdDesc':
          return b.userId - a.userId;
      }
    });
    return list;
  }, [users, searchQuery, sortOption]);

  // Handle edit and delete
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
              <div className="user-menu-item" onClick={() => logout()}>Đăng xuất</div>
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
          {error && (
            <div style={{ color: 'red', textAlign: 'center', padding: '10px' }}>
              {error}
            </div>
          )}
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
                        background: user.position === 'Manager' || user.position === 'Administrator' ? '#fff0f0' : '#f0fff0',
                        color: user.position === 'Manager' || user.position === 'Administrator' ? '#e74c3c' : '#27ae60',
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
                        background: user.status ? '#f0fff0' : '#fff0f0',
                        color: user.status ? '#27ae60' : '#e74c3c',
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '600'
                      }}>
                        {user.status ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ color: '#95a5a6', fontSize: '13px' }}>
                      {formatDate(user.updatedAt || user.createdAt)}
                    </td>
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
                {visibleUsers.length === 0 && !error && (
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

      {/* Modal Edit User */}
      {editUser && (
        <UserModal title="Chỉnh sửa người dùng" onClose={() => setEditUser(null)}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              // TODO: Call API to update user
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

      {/* Modal Delete Confirm */}
      {deleteUser && (
        <UserModal title="Xác nhận xóa" onClose={() => setDeleteUser(null)}>
          <p>Bạn chắc chắn muốn xóa <b>{deleteUser.fullName}</b>?</p>
          <div style={{display:'flex', justifyContent:'flex-end', gap:'10px', marginTop:'15px'}}>
            <button onClick={() => setDeleteUser(null)}>Hủy</button>
            <button
              style={{background:'#e74c3c', color:'#fff'}}
              onClick={() => {
                setUsers(prev => prev.filter(u => u.userId !== deleteUser.userId));
                // TODO: Call API to delete user
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