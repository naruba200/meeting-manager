import React, { useState, useEffect, useMemo } from 'react';
import CreateUserForm from './CreateUserForm';
import EditUserForm from '../components/UserModal.jsx';
import Modal from '../components/Modal.jsx';

import {
  getAllUsers,
  updateUser,
  deleteUser as deleteUserApi,
} from '../services/userService';
import '../assets/styles/UserList.css';

const UserList = () => {
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [deleteUser, setDeleteUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('lastUpdatedDesc');

  // Load users từ API
  const fetchUsers = async () => {
    try {
      const response = await getAllUsers();
      if (response?.content) {
        setUsers(response.content);
      } else {
        setError('Dữ liệu từ API không đúng định dạng.');
      }
    } catch (err) {
      setError('Không thể tải danh sách người dùng.');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Lọc & sắp xếp users
  const visibleUsers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    let list = users.slice();
    if (q) {
      list = list.filter(
        (u) =>
          (u.username || '').toLowerCase().includes(q) ||
          (u.fullName || '').toLowerCase().includes(q) ||
          (u.email || '').toLowerCase().includes(q) ||
          String(u.userId).includes(q)
      );
    }
    list.sort(
      (a, b) =>
        new Date(b.updatedAt || b.createdAt) -
        new Date(a.updatedAt || a.createdAt)
    );
    return list;
  }, [users, searchQuery, sortOption]);

  // ✅ Lưu user sau khi edit
  const handleSaveUser = async (userData) => {
    try {
      await updateUser(editUser.userId, userData);
      setEditUser(null);
      await fetchUsers(); // reload lại danh sách
    } catch (err) {
      alert('Cập nhật thất bại: ' + (err.response?.data?.message || err.message));
    }
  };

  // ✅ Xóa user
  const handleDeleteUserConfirm = async () => {
    try {
      await deleteUserApi(deleteUser.userId);
      setDeleteUser(null);
      await fetchUsers(); // reload lại danh sách
    } catch (err) {
      alert('Xóa thất bại: ' + (err.response?.data?.message || err.message));
    }
  };

  // ✅ Sau khi thêm user xong, reload lại list
  const handleCreateUserSuccess = async () => {
    setIsCreateFormOpen(false);
    await fetchUsers();
  };

  return (
    <div className="userlist-container">
      <header className="header">
        <div className="header-actions">
          <input
            type="text"
            placeholder="Search users..."
            className="search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
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
        {error && <div style={{ color: 'red' }}>{error}</div>}
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
                  <td>{user.userId}</td>
                  <td>{user.username}</td>
                  <td>{user.email}</td>
                  <td>{user.fullName}</td>
                  <td>{user.phone}</td>
                  <td>{user.department}</td>
                  <td>{user.position}</td>
                  <td>{user.status ? 'Active' : 'Inactive'}</td>
                  <td>{user.updatedAt || user.createdAt}</td>
                  <td>
                    <button onClick={() => setEditUser(user)}>✎</button>
                    <button onClick={() => setDeleteUser(user)}>✗</button>
                  </td>
                </tr>
              ))}
              {visibleUsers.length === 0 && (
                <tr>
                  <td colSpan={10}>No users found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>


      {/* Modal Add */}
      {isCreateFormOpen && (
        <CreateUserForm
          onClose={() => setIsCreateFormOpen(false)}
          onSuccess={handleCreateUserSuccess} // ✅ gọi lại fetchUsers sau khi tạo
        />
      )}

      {/* Modal Edit */}
      {editUser && (
        <EditUserForm
          userData={editUser}
          onClose={() => setEditUser(null)}
          onSave={handleSaveUser}
        />
      )}

      {/* Modal Delete */}
      {deleteUser && (

        <Modal title="Delete confirm?" onClose={() => setDeleteUser(null)}>
          <p>Bạn chắc chắn muốn xóa <b>{deleteUser.fullName}</b>?</p>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '15px' }}>
            <button onClick={() => setDeleteUser(null)}>Hủy</button>
            <button
              style={{ background: '#e74c3c', color: '#fff' }}
              onClick={handleDeleteUserConfirm}
            >
              Xóa
            </button>
          </div>

        </Modal>
      )}
    </div>
  );
};

export default UserList;
