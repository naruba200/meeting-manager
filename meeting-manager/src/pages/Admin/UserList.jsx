import React, { useState, useEffect, useMemo } from 'react';
import CreateUserForm from './CreateUserForm';
import EditUserForm from '../../components/UserModal.jsx';
import Modal from '../../components/Modal.jsx';
import '../../assets/styles/UserTable.css';
import {
  getAllUsers,
  updateUser,
  deleteUser as deleteUserApi,
} from '../../services/userService.js';
import SearchBar from '../../components/Searchbar.jsx';
import { FiUser, FiPlus, FiEdit2, FiTrash2, FiUserCheck, FiUserX } from 'react-icons/fi';

const UserList = () => {
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [deleteUser, setDeleteUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('lastUpdatedDesc');
  const [loading, setLoading] = useState(true);

  // Fetch users from API
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await getAllUsers();
      if (response?.content) {
        setUsers(response.content);
      } else {
        setError('Invalid data format from API.');
      }
    } catch (err) {
      setError('Failed to load user list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filter & sort users
  const visibleUsers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    let list = users.slice();

    if (q) {
      list = list.filter(
        (u) =>
          (u.username || "").toLowerCase().includes(q) ||
          (u.fullName || "").toLowerCase().includes(q) ||
          (u.email || "").toLowerCase().includes(q) ||
          String(u.userId).includes(q)
      );
    }

    switch (sortOption) {
      case "nameAsc":
        list.sort((a, b) => (a.fullName || "").localeCompare(b.fullName || ""));
        break;
      case "nameDesc":
        list.sort((a, b) => (b.fullName || "").localeCompare(a.fullName || ""));
        break;
      case "createdAtAsc":
        list.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case "createdAtDesc":
        list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case "lastUpdatedDesc":
      default:
        list.sort(
          (a, b) =>
            new Date(b.updatedAt || b.createdAt) -
            new Date(a.updatedAt || a.createdAt)
        );
        break;
    }

    return list;
  }, [users, searchQuery, sortOption]);

  // ✅ Save edited user
  const handleSaveUser = async (userData) => {
    try {
      await updateUser(editUser.userId, userData);
      setEditUser(null);
      await fetchUsers();
    } catch (err) {
      alert('Update failed: ' + (err.response?.data?.message || err.message));
    }
  };

  // ✅ Delete user
  const handleDeleteUserConfirm = async () => {
    try {
      await deleteUserApi(deleteUser.userId);
      setDeleteUser(null);
      await fetchUsers();
    } catch (err) {
      alert('Delete failed: ' + (err.response?.data?.message || err.message));
    }
  };

  // ✅ Refresh list after creating user
  const handleCreateUserSuccess = async () => {
    setIsCreateFormOpen(false);
    await fetchUsers();
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="user-list-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading user list...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="user-list-container">
      <div className="user-list-header">
        <div className="header-content">
          <div className="title-section">
            <FiUser className="title-icon" />
            <h1 className="page-title">User Management</h1>
          </div>
          <div className="header-stats">
            <div className="stat-card">
              <span className="stat-number">{users.length}</span>
              <span className="stat-label">Total Users</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">
                {users.filter(u => u.status).length}
              </span>
              <span className="stat-label">Active Users</span>
            </div>
          </div>
        </div>
      </div>

      <SearchBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        sortOption={sortOption}
        setSortOption={setSortOption}
        onAddRoom={() => setIsCreateFormOpen(true)}
      />

      <section className="content-section">
        {error && <div className="error-message">{error}</div>}
        
        <div className="table-wrapper">
          <table className="modern-user-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Username</th>
                <th>Email</th>
                <th>Full Name</th>
                <th>Phone</th>
                <th>Department</th>
                <th>Position</th>
                <th>Status</th>
                <th>Last Updated</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {visibleUsers.map((user) => (
                <tr key={user.userId} className={!user.status ? 'inactive-user' : ''}>
                  <td className="user-id">#{user.userId}</td>
                  <td className="username">{user.username}</td>
                  <td className="email">{user.email}</td>
                  <td className="fullname">{user.fullName}</td>
                  <td className="phone">{user.phone || '-'}</td>
                  <td className="department">{user.department || '-'}</td>
                  <td className="position">{user.position || '-'}</td>
                  <td>
                    <span className={`status-badge ${user.status ? 'active' : 'inactive'}`}>
                      {user.status ? (
                        <>
                          <FiUserCheck className="status-icon" />
                          Active
                        </>
                      ) : (
                        <>
                          <FiUserX className="status-icon" />
                          Inactive
                        </>
                      )}
                    </span>
                  </td>
                  <td className="date">{formatDate(user.updatedAt || user.createdAt)}</td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="action-btn edit-btn" 
                        onClick={() => setEditUser(user)}
                        title="Edit"
                      >
                        <FiEdit2 size={14} />
                      </button>
                      <button 
                        className="action-btn delete-btn" 
                        onClick={() => setDeleteUser(user)}
                        title="Delete"
                      >
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {visibleUsers.length === 0 && (
                <tr className="no-data">
                  <td colSpan={10}>
                    <div className="empty-state">
                      <FiUser size={48} className="empty-icon" />
                      <p>No users found</p>
                    </div>
                  </td>
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
          onSuccess={handleCreateUserSuccess}
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
        <Modal title="Confirm Deletion" onClose={() => setDeleteUser(null)}>
          <div className="delete-modal-content">
            <div className="warning-icon">⚠️</div>
            <p>Are you sure you want to delete user <strong>"{deleteUser.fullName}"</strong>?</p>
            <p className="warning-text">This action cannot be undone.</p>
            <div className="modal-actions">
              <button 
                className="btn-secondary" 
                onClick={() => setDeleteUser(null)}
              >
                Cancel
              </button>
              <button
                className="btn-danger"
                onClick={handleDeleteUserConfirm}
              >
                Delete User
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default UserList;
