import React, { useState } from 'react';
import { createEquipment } from '../../services/equipmentService';
import '../../assets/styles/EquipmentForm.css';

const CreateEquipmentForm = ({ onClose }) => {
  const [formData, setFormData] = useState({
    equipmentName: '',
    description: '',
    totalQuantity: '',
    status: 'AVAILABLE',
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
      totalQuantity: parseInt(formData.totalQuantity, 10), // ép kiểu số
    };

    try {
      const response = await createEquipment(payload);

      if (response?.message) {
        alert(response.message);
      } else {
        alert('Tạo thiết bị thành công!');
      }

      onClose();
      window.location.reload();
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi tạo thiết bị');
      console.error('Lỗi API:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-modal-overlay">
      <div className="create-modal">
        <div className="create-modal-header">
          <h2>Thêm thiết bị mới</h2>
          <span className="close-modal" onClick={onClose}>×</span>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="create-form">
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="equipmentName">Tên thiết bị *</label>
              <input
                type="text"
                id="equipmentName"
                name="equipmentName"
                value={formData.equipmentName}
                onChange={handleInputChange}
                required
                placeholder="Nhập tên thiết bị"
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Mô tả</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Nhập mô tả thiết bị"
              />
            </div>

            <div className="form-group">
              <label htmlFor="totalQuantity">Số lượng *</label>
              <input
                type="number"
                id="totalQuantity"
                name="totalQuantity"
                value={formData.totalQuantity}
                onChange={handleInputChange}
                required
                min="1"
                placeholder="Nhập số lượng"
              />
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
                <option value="AVAILABLE">Sẵn sàng</option>
                <option value="UNAVAILABLE">Không khả dụng</option>
              </select>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="cancel-button" onClick={onClose}>
              Hủy
            </button>
            <button type="submit" className="submit-button" disabled={loading}>
              {loading ? 'Đang tạo...' : 'Tạo thiết bị'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEquipmentForm;
