import React, { useState, useEffect, useMemo } from "react";
import CreateUserForm from "./CreateUserForm";
import EditUserForm from "../../components/UserModal.jsx";
import Modal from "../../components/Modal.jsx";
import "../../assets/styles/UserTable.css";
import {
  getAllUsers,
  updateUser,
  deleteUser as deleteUserApi,
} from "../../services/userService.js";
import { FiUser, FiEdit2, FiTrash2, FiUserCheck, FiUserX, FiChevronDown } from "react-icons/fi";

const UserList = () => {
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [deleteUser, setDeleteUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  // Selection states
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  // Pagination states
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Fetch users from API
  const fetchUsers = async (currentPage = page) => {
    try {
      setLoading(true);
      const response = await getAllUsers(currentPage, size);

      if (response?.content) {
        setUsers(response.content);
        setTotalPages(response.totalPages);
        setTotalElements(response.totalElements);
        setPage(response.number);
      } else {
        setError("Invalid data format from API.");
      }
    } catch (err) {
      setError("Failed to load user list.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Handle selection
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedUsers(users.map(u => u.userId));
    } else {
      setSelectedUsers([]);
    }
    setSelectAll(e.target.checked);
  };

  const toggleSelect = (userId) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const isSelected = (userId) => selectedUsers.includes(userId);

  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      fetchUsers(newPage);
    }
  };

  // Filter users
  const visibleUsers = useMemo(() => {
    let list = users.slice();

    const q = searchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (u) =>
          (u.username || "").toLowerCase().includes(q) ||
          (u.fullName || "").toLowerCase().includes(q) ||
          (u.email || "").toLowerCase().includes(q) ||
          String(u.userId).includes(q)
      );
    }

    if (statusFilter !== "all") {
      list = list.filter((u) => String(u.status) === statusFilter);
    }

    if (roleFilter !== "all") {
      list = list.filter((u) => (u.position || "").toLowerCase() === roleFilter.toLowerCase());
    }

    return list;
  }, [users, searchQuery, statusFilter, roleFilter]);

  // Save, delete, create handlers
  const handleSaveUser = async (userData) => {
    try {
      await updateUser(editUser.userId, userData);
      setEditUser(null);
      await fetchUsers(page);
    } catch (err) {
      alert("Update failed: " + (err.response?.data?.message || err.message));
    }
  };

  const handleDeleteUserConfirm = async () => {
    try {
      await deleteUserApi(deleteUser.userId);
      setDeleteUser(null);
      await fetchUsers(page);
    } catch (err) {
      alert("Delete failed: " + (err.response?.data?.message || err.message));
    }
  };

  const handleCreateUserSuccess = async () => {
    setIsCreateFormOpen(false);
    await fetchUsers(page);
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Role options (assuming common roles; adjust based on data)
  const roleOptions = [
    { value: "all", label: "All Roles" },
    { value: "admin", label: "Admin" },
    { value: "user", label: "User" },
    { value: "guest", label: "Guest" },
  ];

  // Status options
  const statusOptions = [
    { value: "all", label: "All Status" },
    { value: "true", label: "Active" },
    { value: "false", label: "Blocked" },
  ];

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
      {/* HEADER */}
      <div className="user-list-header">
        <div className="header-content">
          <div className="title-section">
            <FiUser className="title-icon" />
            <h1 className="page-title">All accounts</h1>
          </div>
          <div className="filter-bar">
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="filter-select"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="filter-select"
            >
              {roleOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <button className="add-user-btn" onClick={() => setIsCreateFormOpen(true)}>
              Add User
            </button>
          </div>
        </div>
      </div>

      {/* TABLE */}
      <section className="content-section">
        {error && <div className="error-message">{error}</div>}
        <div className="table-wrapper">
          <table className="user-table">
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    checked={selectAll || (users.length > 0 && selectedUsers.length === users.length)}
                    onChange={handleSelectAll}
                  />
                </th>
                <th>Name</th>
                <th>Status</th>
                <th>Last Online</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {visibleUsers.map((user) => (
                <tr key={user.userId}>
                  <td>
                    <input
                      type="checkbox"
                      checked={isSelected(user.userId)}
                      onChange={() => toggleSelect(user.userId)}
                    />
                  </td>
                  <td className="name-cell">
                    <div className="user-info">
                      <div className="user-avatar">{user.fullName?.charAt(0).toUpperCase()}</div>
                      <div>
                        <div className="user-name">{user.fullName || user.username}</div>
                        <div className="user-email">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span
                      className={`status-badge ${user.status ? "active" : "blocked"}`}
                    >
                      {user.status ? (
                        <>
                          <FiUserCheck /> Active
                        </>
                      ) : (
                        <>
                          <FiUserX /> Blocked
                        </>
                      )}
                    </span>
                  </td>
                  <td className="last-online">{formatDateTime(user.updatedAt || user.createdAt)}</td>
                  <td>
                    <div className="role-cell">
                      <span className="role-label">{user.position || "User"}</span>
                      <FiChevronDown className="role-icon" />
                    </div>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="action-btn edit-btn"
                        onClick={() => setEditUser(user)}
                      >
                        <FiEdit2 size={14} />
                      </button>
                      <button
                        className="action-btn delete-btn"
                        onClick={() => setDeleteUser(user)}
                      >
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {visibleUsers.length === 0 && (
                <tr className="no-data">
                  <td colSpan={6}>No users found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* PAGINATION */}
      <div className="pagination">
        <button
          className={`page-btn ${page === 0 ? "disabled" : ""}`}
          disabled={page === 0}
          onClick={() => handlePageChange(page - 1)}
        >
          Previous
        </button>

        {[...Array(totalPages)].map((_, index) => (
          <button
            key={index}
            className={`page-btn ${page === index ? "active" : ""}`}
            onClick={() => handlePageChange(index)}
          >
            {index + 1}
          </button>
        ))}

        <button
          className={`page-btn ${page + 1 >= totalPages ? "disabled" : ""}`}
          disabled={page + 1 >= totalPages}
          onClick={() => handlePageChange(page + 1)}
        >
          Next
        </button>
      </div>

      {/* MODALS */}
      {isCreateFormOpen && (
        <CreateUserForm
          onClose={() => setIsCreateFormOpen(false)}
          onSuccess={handleCreateUserSuccess}
        />
      )}
      {editUser && (
        <EditUserForm
          userData={editUser}
          onClose={() => setEditUser(null)}
          onSave={handleSaveUser}
        />
      )}
      {deleteUser && (
        <Modal title="Confirm Deletion" onClose={() => setDeleteUser(null)}>
          <div className="delete-modal-content">
            <div className="warning-icon">⚠️</div>
            <p>
              Are you sure you want to delete user{" "}
              <strong>"{deleteUser.fullName}"</strong>?
            </p>
            <p className="warning-text">This action cannot be undone.</p>
            <div className="modal-actions">
              <button
                className="btn-secondary"
                onClick={() => setDeleteUser(null)}
              >
                Cancel
              </button>
              <button className="btn-danger" onClick={handleDeleteUserConfirm}>
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