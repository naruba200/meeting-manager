// src/pages/User/ProfilePage.jsx
import React, { useEffect, useState, useRef } from "react";
import apiClient from "../../services/apiClient";
import "../../assets/styles/UserCSS/UserProfile.css";

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await apiClient.get("/user/profile");
        setProfile(res.data);
      } catch (err) {
        console.error("Lỗi khi lấy hồ sơ:", err);
        setError("Không thể tải thông tin hồ sơ. Vui lòng đăng nhập lại.");
      }
    };

    fetchProfile();
  }, []);

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
      // Gửi ảnh lên server
      const formData = new FormData();
      const file = await fetch(selectedImage).then(r => r.blob());
      formData.append('avatar', file);

      const res = await apiClient.post('/user/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Cập nhật profile với avatar mới
      setProfile(prev => ({
        ...prev,
        avatar: res.data.avatarUrl
      }));
      
      setShowAvatarModal(false);
      setSelectedImage(null);
    } catch (err) {
      console.error('Lỗi khi upload avatar:', err);
      alert('Có lỗi xảy ra khi upload ảnh đại diện');
    }
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
      {/* Header với Avatar */}
      <div className="profile-header">
        <div className="avatar-section">
          <div className="avatar-container" onClick={handleAvatarClick}>
            {profile.avatar ? (
              <img 
                src={profile.avatar} 
                alt="Avatar" 
                className="avatar-image"
              />
            ) : (
              <div className="avatar-placeholder">
                {getInitials(profile.displayName || profile.username)}
              </div>
            )}
            <div className="avatar-overlay">
              <span className="avatar-overlay-icon">📷</span>
            </div>
          </div>
          <button 
            className="btn-change-avatar"
            onClick={handleAvatarClick}
          >
            Đổi ảnh đại diện
          </button>
          <input
            type="file"
            ref={fileInputRef}
            className="file-input"
            accept="image/*"
            onChange={handleFileSelect}
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
        </div>
        
        <div className="profile-item">
          <div className="item-info">
            <span className="item-label">Tên hiển thị</span>
            <span className="item-value">{profile.displayName || profile.username}</span>
          </div>
          <div className="item-actions">
            <button className="btn-edit">Chỉnh sửa</button>
          </div>
        </div>

        <div className="profile-item">
          <div className="item-info">
            <span className="item-label">Tên đăng nhập</span>
            <span className="item-value">{profile.username}</span>
          </div>
          <div className="item-actions">
            <button className="btn-edit">Chỉnh sửa</button>
          </div>
        </div>

        <div className="profile-item">
          <div className="item-info">
            <span className="item-label">Email</span>
            <span className="item-value">
              {profile.email ? '*******' + profile.email.split('@')[0].slice(-2) + '@' + profile.email.split('@')[1] : 'Chưa có email'}
            </span>
          </div>
          <div className="item-actions">
            <button className="btn-edit">Chỉnh sửa</button>
          </div>
        </div>

        <div className="profile-item">
          <div className="item-info">
            <span className="item-label">Số Điện Thoại</span>
            <span className="item-value masked">
              {profile.phone || "Bạn chưa thêm số điện thoại nào cả."}
            </span>
          </div>
          <div className="item-actions">
            <button className="btn-add">Thêm</button>
          </div>
        </div>
      </div>

      {/* Mật khẩu và xác thực */}
      <div className="password-section">
        <h2>Mật Khẩu và Xác Thực</h2>
        <button className="btn-change-password">
          Đổi Mật Khẩu
        </button>
      </div>

      {/* Modal xác nhận upload avatar */}
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
              <button 
                className="btn-upload"
                onClick={handleUploadAvatar}
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}