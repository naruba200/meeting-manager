import React, { useState } from 'react';
import '../assets/styles/CreateMeetingRoomForm.css';

const CreateMeetingRoomForm = ({ onClose, onSave }) => {
  const [formData, setFormData] = useState({
    roomName: '',
    type: 'PHYSICAL',
    status: 'AVAILABLE',
  });
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!formData.roomName.trim()) {
      newErrors.roomName = 'Tên phòng họp không được để trống.';
    } else if (formData.roomName.length > 100) {
      newErrors.roomName = 'Tên phòng họp không được vượt quá 100 ký tự.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for the field being edited
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSave(formData);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Tạo phòng họp mới</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label htmlFor="roomName">Tên phòng họp</label>
            <input
              type="text"
              id="roomName"
              name="roomName"
              value={formData.roomName}
              onChange={handleChange}
              placeholder="Nhập tên phòng họp"
              className={errors.roomName ? 'input-error' : ''}
            />
            {errors.roomName && <span className="error-text">{errors.roomName}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="type">Loại phòng</label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
            >
              <option value="PHYSICAL">Physical</option>
              <option value="ONLINE">Online</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="status">Trạng thái</label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="AVAILABLE">Available</option>
              <option value="UNAVAILABLE">Unavailable</option>
            </select>
          </div>
        </div>
        <div className="modal-footer">
          <button className="cancel-button" onClick={onClose}>Hủy</button>
          <button className="save-button" onClick={handleSubmit}>Lưu</button>
        </div>
      </div>
    </div>
  );
};

export default CreateMeetingRoomForm;