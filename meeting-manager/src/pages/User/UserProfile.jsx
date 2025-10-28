import React, { useEffect, useState, useRef, useCallback } from "react";
import apiClient from "../../services/apiClient";
import { getUserById, updateUser } from '../../services/userService';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import "../../assets/styles/UserCSS/UserProfile.css";
import { useNavigate } from "react-router-dom";

// Helper function to extract message inside quotation marks
const extractQuotedMessage = (errorMessage) => {
  const match = errorMessage.match(/"([^"]+)"/);
  return match ? match[1] : errorMessage;
};

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    username: '',
    phone: '',
    email: ''
  });
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const fetchProfile = useCallback(async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user?.userId) {
        setError('Không tìm thấy thông tin người dùng');
        return;
      }

      const userData = await getUserById(user.userId);
      console.log('Fetched user data:', userData);
      setProfile(userData);
    } catch (err) {
      console.error('Error fetching profile:', err);
      const errorMessage = err.response?.data?.message || 'Lỗi khi tải thông tin người dùng';
      setError(extractQuotedMessage(errorMessage));
      toast.error(extractQuotedMessage(errorMessage));
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    if (profile) {
      setEditForm({
        username: profile.username || '',
        phone: profile.phone || '',
        email: profile.email || ''
      });
    }
  }, [profile]);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setSelectedImage(e.target.result);
          setShowAvatarModal(true);
        };
        reader.readAsDataURL(file);
      } else {
        alert('Vui lòng chọn file hình ảnh');
      }
    }
  };

  const handleUploadAvatar = async () => {
    if (!selectedImage) return;

    try {
      const formData = new FormData();
      const file = await fetch(selectedImage).then(r => r.blob());
      formData.append('avatar', file);

      const res = await apiClient.post('/user/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setProfile(prev => ({
        ...prev,
        avatar: res.data.avatarUrl
      }));
      
      setShowAvatarModal(false);
      setSelectedImage(null);
    } catch (err) {
      console.error('Lỗi khi upload avatar:', err);
      const errorMessage = err.response?.data?.message || 'Có lỗi xảy ra khi upload ảnh đại diện';
      alert(extractQuotedMessage(errorMessage));
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditForm({
      username: profile.username || '',
      phone: profile.phone || '',
      email: profile.email || ''
    });
  };

  const handleSaveEdit = async () => {
    // Validation
    if (!editForm.username || !editForm.email || !editForm.phone) {
      toast.error("Tất cả các trường không được để trống");
      return;
    }
    if (
      editForm.username === profile.username &&
      editForm.email === profile.email &&
      editForm.phone === profile.phone
    ) {
      toast.error("Không có thay đổi nào để lưu");
      return;
    }

    try {
      const user = JSON.parse(localStorage.getItem('user'));
      await updateUser(user.userId, editForm);
      toast.success('Cập nhật thông tin thành công!');
      setIsEditing(false);
      fetchProfile();
    } catch (err) {
      console.error('Error updating profile:', err);
      const errorMessage = err.response?.data?.message;
      toast.error(extractQuotedMessage(errorMessage));
    }
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const getInitials = (name) => {
    return name ? name.charAt(0).toUpperCase() : 'U';
  };

  if (error) {
    return <div className="profile-container error">{error}</div>;
  }

  if (!profile) {
    return <div className="profile-container loading">Đang tải thông tin...</div>;
  }

  return (
    <div className="profile-container">
      <ToastContainer hideProgressBar={true} />
      
      {/* Header với Avatar */}
      <div className="profile-header">
        <div className="avatar-section">
          <div className="avatar-container" onClick={handleAvatarClick}>
            {profile.avatar ? (
              <img src={profile.avatar} alt="Avatar" className="avatar-image" />
            ) : (
              <div className="avatar-placeholder">
                {getInitials(profile.displayName || profile.username)}
              </div>
            )}
            <div className="avatar-overlay">
              <span className="avatar-overlay-icon">Camera</span>
            </div>
          </div>
          <button className="btn-change-avatar" onClick={handleAvatarClick}>
            Đổi ảnh đại diện
          </button>
          <input
            type="file"
            ref={fileInputRef}
            className="file-input"
            accept="image/*"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
        </div>
        
        <div className="profile-info-header">
          <h1>{profile.displayName || profile.username}</h1>
          <p>Chào mừng bạn trở lại!</p>
        </div>
      </div>

      {/* Thông tin cá nhân */}
      <div className="profile-section">
        <div className="section-header">
          <h2>Thông tin cá nhân</h2>
          {!isEditing ? (
            <button className="btn-edit" onClick={handleEdit}>
              Chỉnh sửa
            </button>
          ) : (
            <div className="edit-actions">
              <button className="btn-cancel" onClick={handleCancelEdit}>
                Hủy
              </button>
              <button className="btn-save" onClick={handleSaveEdit}>
                Lưu
              </button>
            </div>
          )}
        </div>

        {!isEditing ? (
          <>
            <div className="profile-item">
              <div className="item-info">
                <span className="item-label">Tên hiển thị</span>
                <span className="item-value">{profile.username || 'Chưa cập nhật'}</span>
              </div>
            </div>

            <div className="profile-item">
              <div className="item-info">
                <span className="item-label">Email</span>
                <span className="item-value">{profile.email || 'Chưa cập nhật'}</span>
              </div>
            </div>

            <div className="profile-item">
              <div className="item-info">
                <span className="item-label">Số điện thoại</span>
                <span className="item-value">{profile.phone || 'Chưa cập nhật'}</span>
              </div>
            </div>
          </>
        ) : (
          <div className="edit-form">
            <div className="form-group">
              <label>Tên hiển thị</label>
              <input
                type="text"
                name="username"
                value={editForm.username}
                onChange={handleEditFormChange}
                className={error.username ? 'input-error' : ''}
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={editForm.email}
                onChange={handleEditFormChange}
                className={error.email ? 'input-error' : ''}
              />
            </div>

            <div className="form-group">
              <label>Số điện thoại</label>
              <input
                type="tel"
                name="phone"
                value={editForm.phone}
                onChange={handleEditFormChange}
                className={error.phone ? 'input-error' : ''}
              />
            </div>
          </div>
        )}
      </div>

      {/* Mật khẩu */}
      <div className="password-section">
        <h2>Mật Khẩu và Xác Thực</h2>
        <button 
          className="btn-change-password"
          onClick={() => navigate('/password-change')}
        >
          Đổi Mật Khẩu
        </button>
      </div>

      {/* Modal upload avatar */}
      {showAvatarModal && (
        <div className="avatar-modal-overlay">
          <div className="avatar-modal">
            <h3>Xác nhận ảnh đại diện mới</h3>
            <div className="avatar-preview">
              <img src={selectedImage} alt="Preview" />
            </div>
            <div className="avatar-actions">
              <button 
                className="btn-cancel"
                onClick={() => {
                  setShowAvatarModal(false);
                  setSelectedImage(null);
                }}
              >
                Hủy
              </button>
              <button className="btn-upload" onClick={handleUploadAvatar}>
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}