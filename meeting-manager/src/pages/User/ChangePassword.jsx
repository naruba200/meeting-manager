import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../../services/apiClient";
import "../../assets/styles/UserCSS/ChangePassword.css";

const ChangePassword = () =>{
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.currentPassword.trim()) {
      newErrors.currentPassword = "Vui lòng nhập mật khẩu hiện tại";
    }

    if (!formData.newPassword.trim()) {
      newErrors.newPassword = "Vui lòng nhập mật khẩu mới";
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = "Mật khẩu phải có ít nhất 6 ký tự";
    }

    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = "Vui lòng xác nhận mật khẩu";
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Mật khẩu xác nhận không khớp";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setSuccessMessage("");

    try {
      await apiClient.put("/user/password-change", {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      });

      setSuccessMessage("Đổi mật khẩu thành công!");
      
      // Reset form
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });

      // Redirect to profile page after 2 seconds
      setTimeout(() => {
        navigate("/profile");
      }, 2000);

    } catch (err) {
      console.error("Lỗi khi đổi mật khẩu:", err);
      if (err.response?.status === 400) {
        setErrors({ 
          submit: "Mật khẩu mới phải khác mật khẩu hiện tại" 
        });
      } else {
        setErrors({ 
          submit: "Có lỗi xảy ra khi đổi mật khẩu. Vui lòng thử lại." 
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/profile");
  };

  return (
    <div className="change-password-container">
      <div className="change-password-card">
        <div className="password-header">
          <button 
            className="btn-back"
            onClick={handleCancel}
            aria-label="Quay lại"
          >
            ←
          </button>
          <h1>Đổi Mật Khẩu</h1>
        </div>

        <p className="password-subtitle">
          Để bảo vệ tài khoản của bạn, vui lòng sử dụng mật khẩu mạnh và không sử dụng lại mật khẩu cũ.
        </p>

        <form onSubmit={handleSubmit} className="password-form">
          {/* Current Password */}
          <div className="form-group">
            <label htmlFor="currentPassword" className="form-label">
              Mật khẩu hiện tại
            </label>
            <input
              type="password"
              id="currentPassword"
              name="currentPassword"
              value={formData.currentPassword}
              onChange={handleChange}
              className={`form-input ${errors.currentPassword ? 'error' : ''}`}
              placeholder="Nhập mật khẩu hiện tại"
              disabled={isLoading}
            />
            {errors.currentPassword && (
              <span className="error-message">{errors.currentPassword}</span>
            )}
          </div>

          {/* New Password */}
          <div className="form-group">
            <label htmlFor="newPassword" className="form-label">
              Mật khẩu mới
            </label>
            <input
              type="password"
              id="newPassword"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              className={`form-input ${errors.newPassword ? 'error' : ''}`}
              placeholder="Nhập mật khẩu mới (ít nhất 6 ký tự)"
              disabled={isLoading}
            />
            {errors.newPassword && (
              <span className="error-message">{errors.newPassword}</span>
            )}
          </div>

          {/* Confirm Password */}
          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">
              Xác nhận mật khẩu mới
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
              placeholder="Nhập lại mật khẩu mới"
              disabled={isLoading}
            />
            {errors.confirmPassword && (
              <span className="error-message">{errors.confirmPassword}</span>
            )}
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <div className="error-message submit-error">
              {errors.submit}
            </div>
          )}

          {/* Success Message */}
          {successMessage && (
            <div className="success-message">
              {successMessage}
            </div>
          )}

          {/* Action Buttons */}
          <div className="form-actions">
            <button
              type="button"
              onClick={handleCancel}
              className="btn btn-cancel"
              disabled={isLoading}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading}
            >
              {isLoading ? "Đang xử lý..." : "Đổi Mật Khẩu"}
            </button>
          </div>
        </form>

        {/* Password Requirements */}
        <div className="password-requirements">
          <h3>Yêu cầu mật khẩu:</h3>
          <ul>
            <li>Ít nhất 6 ký tự</li>
            <li>Nên kết hợp chữ hoa, chữ thường, số và ký tự đặc biệt</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default ChangePassword;