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
      totalQuantity: parseInt(formData.totalQuantity, 10), // convert to number
    };

    try {
      const response = await createEquipment(payload);

      if (response?.message) {
        alert(response.message);
      } else {
        alert('Equipment created successfully!');
      }

      onClose();
      window.location.reload();
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred while creating the equipment.');
      console.error('API Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-modal-overlay">
      <div className="create-modal">
        <div className="create-modal-header">
          <h2>Add New Equipment</h2>
          <span className="close-modal" onClick={onClose}>×</span>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="create-form">
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="equipmentName">Equipment Name *</label>
              <input
                type="text"
                id="equipmentName"
                name="equipmentName"
                value={formData.equipmentName}
                onChange={handleInputChange}
                required
                placeholder="Enter equipment name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter equipment description"
              />
            </div>

            <div className="form-group">
              <label htmlFor="totalQuantity">Quantity *</label>
              <input
                type="number"
                id="totalQuantity"
                name="totalQuantity"
                value={formData.totalQuantity}
                onChange={handleInputChange}
                required
                min="1"
                placeholder="Enter total quantity"
              />
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
                <option value="AVAILABLE">Available</option>
                <option value="UNAVAILABLE">Unavailable</option>
              </select>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="cancel-button" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="submit-button" disabled={loading}>
              {loading ? 'Creating...' : 'Create Equipment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEquipmentForm;
