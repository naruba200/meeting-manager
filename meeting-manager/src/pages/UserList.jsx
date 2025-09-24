<<<<<<< HEAD
import React, { useState, useEffect } from 'react';
import CreateUserForm from './CreateUserForm';
=======
import React, { useState, useRef, useEffect } from 'react';
>>>>>>> 7055bc862d72953d3432a5661104d00fa5e75fee
import '../assets/styles/UserList.css';

const UserList = () => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMainSidebarOpen, setIsMainSidebarOpen] = useState(true);
<<<<<<< HEAD
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);
  const [touchStartX, setTouchStartX] = useState(null);
  const [touchCurrentX, setTouchCurrentX] = useState(null);

  // Expanded user list to demonstrate scrollable content
=======
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  
  const dropdownRef = useRef(null);
  
>>>>>>> 7055bc862d72953d3432a5661104d00fa5e75fee
  const users = [
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
  ];

<<<<<<< HEAD
  // Handle touch start for swiping
  const handleTouchStart = (e) => {
    setTouchStartX(e.touches[0].clientX);
    setTouchCurrentX(e.touches[0].clientX);
  };

  // Handle touch move for swiping
  const handleTouchMove = (e) => {
    setTouchCurrentX(e.touches[0].clientX);
  };

  // Handle touch end to determine swipe action
  const handleTouchEnd = () => {
    if (touchStartX && touchCurrentX) {
      const deltaX = touchCurrentX - touchStartX;
      const swipeThreshold = 100; // Minimum swipe distance in pixels

      if (deltaX > swipeThreshold) {
        // Swipe right: Open sidebars
        setIsMainSidebarOpen(true);
        if (isMainSidebarOpen) {
          setIsUserMenuOpen(true);
        }
      } else if (deltaX < -swipeThreshold) {
        // Swipe left: Close sidebars
        if (isUserMenuOpen) {
          setIsUserMenuOpen(false);
        } else if (isMainSidebarOpen) {
          setIsMainSidebarOpen(false);
        }
      }
    }
    setTouchStartX(null);
    setTouchCurrentX(null);
  };

  // Add touch event listeners
  useEffect(() => {
    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [touchStartX, touchCurrentX, isMainSidebarOpen, isUserMenuOpen]);
=======
  // Hàm xử lý đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Hàm xử lý thông tin người dùng
  const handleProfileInfo = () => {
    console.log('Xem thông tin người dùng...');
    setIsProfileDropdownOpen(false);
    // Thêm logic xem thông tin ở đây
  };

  // Hàm xử lý đăng xuất
  const handleLogout = () => {
    console.log('Đăng xuất...');
    setIsProfileDropdownOpen(false);
    // Thêm logic đăng xuất ở đây
  };
>>>>>>> 7055bc862d72953d3432a5661104d00fa5e75fee

  return (
    <div className="app-container">
      <nav className="top-navbar">
        <span className="nav-icon">✉︎</span>
        <div className="profile-dropdown-container" ref={dropdownRef}>
          <span 
            className="nav-icon profile-icon" 
            onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
          >
            🜲
          </span>
          
          {isProfileDropdownOpen && (
            <div className="profile-dropdown">
              <div className="dropdown-header">
                <div className="user-avatar">👤</div>
                <div className="user-info">
                  <div className="user-name">Admin User</div>
                  <div className="user-email">admin@company.com</div>
                </div>
              </div>
              
              <div className="dropdown-divider"></div>
              
              <div className="dropdown-item" onClick={handleProfileInfo}>
                <span className="dropdown-icon">🗒</span>
                <span className="dropdown-text">Thông tin tài khoản</span>
              </div>
              
              <div className="dropdown-item" onClick={handleProfileInfo}>
                <span className="dropdown-icon">🛠</span>
                <span className="dropdown-text">Cài đặt tài khoản</span>
              </div>
              
              <div className="dropdown-divider"></div>
              
              <div className="dropdown-item logout-item" onClick={handleLogout}>
                <span className="dropdown-icon">⏻</span>
                <span className="dropdown-text">Đăng xuất</span>
              </div>
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
          <div className="nav-item">
            <span className="nav-icon">🏠︎</span> Home
          </div>
          <div
            className={`nav-item ${isUserMenuOpen ? 'active' : ''}`}
            onClick={() => setIsUserMenuOpen(true)}
          >
            <span className="nav-icon">☺</span> User Management
          </div>
          <div className="nav-item">
            <span className="nav-icon">⏻</span> Settings
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
              <span className="nav-icon">🗒</span> User List
            </div>
<<<<<<< HEAD
            <div className="nav-item" onClick={() => setIsCreateFormOpen(true)}>
              <span className="nav-icon">➕</span> Create
=======
            <div className="nav-item">
              <span className="nav-icon">✚</span> Create
>>>>>>> 7055bc862d72953d3432a5661104d00fa5e75fee
            </div>
            <div className="nav-item">
              <span className="nav-icon">🛠</span> Edit
            </div>
            <div className="nav-item">
              <span className="nav-icon">✗</span> Delete
            </div>
          </nav>
        </aside>
      )}

      {isCreateFormOpen && (
        <CreateUserForm onClose={() => setIsCreateFormOpen(false)} />
      )}
      
      <main className={`main-content ${!isMainSidebarOpen ? 'full' : ''}`}>
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
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
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
                </tr>
              ))}
            </tbody>
          </table>
          {/* Additional content to demonstrate scrolling */}
          <div className="additional-content">
            <h2>Additional Information</h2>
            <p>This section contains more content to demonstrate vertical scrolling. You can add more sections, charts, or other elements here.</p>
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
            <p>Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
          </div>
        </section>
      </main>
    </div>
  );
};

export default UserList;