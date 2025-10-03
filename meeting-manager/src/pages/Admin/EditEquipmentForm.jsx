import React, { useState, useEffect } from 'react';
import '../assets/styles/EquipmentForm.css';

export default function EditEquipmentForm({ equipmentData, onClose, onSave }) {
    const [formData, setFormData] = useState({
        equipmentName: '',
        description: '',
        totalQuantity: '',
        status: 'AVAILABLE'
    });
    const [error, setError] = useState(null);

    useEffect(() => {
        if (equipmentData) {
            setFormData({
                equipmentName: equipmentData.equipmentName || '',
                description: equipmentData.description || '',
                totalQuantity: String(equipmentData.totalQuantity ?? ''),
                status: equipmentData.status || 'AVAILABLE'
            });
        }
    }, [equipmentData]);

    const handleChange = e => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const validateForm = () => {
        if (!formData.equipmentName || formData.equipmentName.length < 3) {
            return "Tên thiết bị phải có ít nhất 3 ký tự";
        }
        if (isNaN(formData.totalQuantity) || formData.totalQuantity < 0) {
            return "Số lượng phải là số không âm";
        }
        return null;
    };

    const handleSubmit = e => {
        e.preventDefault();
        const validationError = validateForm();
        if (validationError) {
            setError(validationError);
            return;
        }
        onSave({
            ...formData,
            totalQuantity: parseInt(formData.totalQuantity, 10)
        });
        onClose();
    };

    const handleOverlay = e => {
        if (e.target.classList.contains('create-modal-overlay')) onClose();
    };

    return (
        <div className="create-modal-overlay" onClick={handleOverlay}>
            <div className="create-modal">
                <div className="create-modal-header">
                    <h2>Edit Equipment</h2>
                    <span className="close-modal" onClick={onClose}>×</span>
                </div>
                <form className="create-form" onSubmit={handleSubmit}>
                    {error && <div style={{ color: 'red', padding: '10px' }}>{error}</div>}
                    <div className="form-grid">
                        <div className="form-group">
                            <label>Equipment Name *</label>
                            <input
                                name="equipmentName"
                                value={formData.equipmentName}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Description</label>
                            <input
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-group">
                            <label>Total Quantity *</label>
                            <input
                                type="number"
                                name="totalQuantity"
                                value={formData.totalQuantity}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Status *</label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                required
                            >
                                <option value="AVAILABLE">Available</option>
                                <option value="DAMAGED">Damaged</option>
                                <option value="MAINTENANCE">Maintenance</option>
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