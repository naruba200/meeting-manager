import React, { useState } from 'react';
import '../assets/styles/CreateUserForm.css';

const CreateUserForm = ({ onClose }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    fullName: '',
    phone: '',
    department: '',
    position: '',
    role: 'STAFF',
    status: '1' // Default to Active (1) as per schema
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Gửi dữ liệu đến backend (password sẽ được hash ở backend trước khi lưu vào password_hash)
    console.log('Tạo user mới:', {
      ...formData,
      status: parseInt(formData.status), // Convert status to number for backend
      // user_id tự động tăng, created_at và updated_at do backend xử lý
    });
    // Reset form và đóng modal
    setFormData({
      username: '',
      password: '',
      email: '',
      fullName: '',
      phone: '',
      department: '',
      position: '',
      role: 'STAFF',
      status: '1'
    });
    onClose();
  };

  const handleOverlayClick = (e) => {
    // Chỉ đóng modal nếu click vào overlay, không phải vào modal nội dung
    if (e.target.classList.contains('create-modal-overlay')) {
      onClose();
    }
  };

  return (
    <div className="create-modal-overlay" onClick={handleOverlayClick}>
      <div className="create-modal">
        <div className="create-modal-header">
          <h2>Create New User Account</h2>
          <span className="close-modal" onClick={onClose}>×</span>
        </div>
        <form onSubmit={handleSubmit} className="create-form">
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="username">Username *</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                required
                placeholder="Enter username"
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password *</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                placeholder="Enter password"
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                placeholder="Enter email"
              />
            </div>
            <div className="form-group">
              <label htmlFor="fullName">Full Name</label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                placeholder="Enter full name"
              />
            </div>
            <div className="form-group">
              <label htmlFor="phone">Phone</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="Enter phone number"
              />
            </div>
            <div className="form-group">
              <label htmlFor="department">Department</label>
              <input
                type="text"
                id="department"
                name="department"
                value={formData.department}
                onChange={handleInputChange}
                placeholder="Enter department"
              />
            </div>
            <div className="form-group">
              <label htmlFor="position">Position</label>
              <input
                type="text"
                id="position"
                name="position"
                value={formData.position}
                onChange={handleInputChange}
                placeholder="Enter position"
              />
            </div>
            <div className="form-group">
              <label htmlFor="role">Role *</label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                required
              >
                <option value="STAFF">Staff</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="status">Status *</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                required
              >
                <option value="1">Active</option>
                <option value="0">Inactive</option>
              </select>
            </div>
          </div>
          <div className="form-actions">
            <button type="button" className="cancel-button" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="submit-button">
              Create User
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateUserForm;