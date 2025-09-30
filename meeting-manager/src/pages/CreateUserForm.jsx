import React, { useState } from 'react';
import { createUser } from '../services/userService';
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
    status: '1',
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const payload = {
      ...formData,
      status: formData.status === '1' ? true : false,
      role: formData.role.toUpperCase(),
    };

    try {
      const response = await createUser(payload);

      if (response?.message) {
        alert(response.message); // hiển thị thông báo thành công
      }

      onClose(); // đóng modal

      // reload lại trang UserList
      window.location.reload();
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi tạo người dùng');
      console.error('Lỗi API:', err);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="create-modal-overlay">
      <div className="create-modal">
        <div className="create-modal-header">
          <h2>Tạo tài khoản người dùng mới</h2>
          <span className="close-modal" onClick={onClose}>×</span>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="create-form">
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="username">Tên đăng nhập *</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                required
                placeholder="Nhập tên đăng nhập"
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Mật khẩu *</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                placeholder="Nhập mật khẩu"
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
                placeholder="Nhập email"
              />
            </div>
            <div className="form-group">
              <label htmlFor="fullName">Họ và tên</label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                placeholder="Nhập họ và tên"
              />
            </div>
            <div className="form-group">
              <label htmlFor="phone">Số điện thoại</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="Nhập số điện thoại"
              />
            </div>
            <div className="form-group">
              <label htmlFor="department">Phòng ban</label>
              <input
                type="text"
                id="department"
                name="department"
                value={formData.department}
                onChange={handleInputChange}
                placeholder="Nhập phòng ban"
              />
            </div>
            <div className="form-group">
              <label htmlFor="position">Chức vụ</label>
              <input
                type="text"
                id="position"
                name="position"
                value={formData.position}
                onChange={handleInputChange}
                placeholder="Nhập chức vụ"
              />
            </div>
            <div className="form-group">
              <label htmlFor="role">Vai trò *</label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                required
              >
                <option value="STAFF">Nhân viên</option>
                <option value="ADMIN">Quản trị viên</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="status">Trạng thái *</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                required
              >
                <option value="1">Kích hoạt</option>
                <option value="0">Không kích hoạt</option>
              </select>
            </div>
          </div>
          <div className="form-actions">
            <button type="button" className="cancel-button" onClick={onClose}>
              Hủy
            </button>
            <button type="submit" className="submit-button" disabled={loading}>
              {loading ? 'Đang tạo...' : 'Tạo người dùng'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateUserForm;
