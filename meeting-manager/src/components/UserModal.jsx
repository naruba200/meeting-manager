// src/pages/EditUserForm.jsx
import React, { useState, useEffect } from 'react';
import '../assets/styles/CreateUserForm.css'; // tái sử dụng CSS của CreateUserForm

export default function EditUserForm({ userData, onClose, onSave }) {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    fullName: '',
    phone: '',
    department: '',
    position: '',
    role: 'STAFF',
    status: '1',
    password: ''
  });

  // đổ dữ liệu người dùng vào form
  useEffect(() => {
    if (userData) {
      setFormData({
        username: userData.username || '',
        email: userData.email || '',
        fullName: userData.fullName || '',
        phone: userData.phone || '',
        department: userData.department || '',
        position: userData.position || '',
        role: userData.role || 'STAFF',
        status: String(userData.status ?? '1'),
        password: ''
      });
    }
  }, [userData]);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = e => {
    e.preventDefault();
    onSave({
      ...formData,
      status: parseInt(formData.status, 10)
    });
    onClose();
  };

  return (
    <div className="create-modal-overlay">
      <div className="create-modal">
        <div className="create-modal-header">
          <h2>Edit User</h2>
          <span className="close-modal" onClick={onClose}>×</span>
        </div>

        <form className="create-form" onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label>Username *</label>
              <input name="username" value={formData.username} onChange={handleChange} required/>
            </div>

            <div className="form-group">
              <label>New Password</label>
              <input type="password" name="password" value={formData.password} onChange={handleChange}
                     placeholder=""/>
            </div>

            <div className="form-group">
              <label>Email *</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} required/>
            </div>

            <div className="form-group">
              <label>Full Name</label>
              <input name="fullName" value={formData.fullName} onChange={handleChange}/>
            </div>

            <div className="form-group">
              <label>Phone</label>
              <input name="phone" value={formData.phone} onChange={handleChange}/>
            </div>

            <div className="form-group">
              <label>Department</label>
              <input name="department" value={formData.department} onChange={handleChange}/>
            </div>

            <div className="form-group">
              <label>Position</label>
              <input name="position" value={formData.position} onChange={handleChange}/>
            </div>

            <div className="form-group">
              <label>Role *</label>
              <select name="role" value={formData.role} onChange={handleChange} required>
                <option value="STAFF">Staff</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>

            <div className="form-group">
              <label>Status *</label>
              <select name="status" value={formData.status} onChange={handleChange} required>
                <option value="1">Active</option>
                <option value="0">Inactive</option>
              </select>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="cancel-button" onClick={onClose}>Cancel</button>
            <button type="submit" className="submit-button">Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  );
}
