import React, { useEffect, useState, useRef, useCallback } from "react";
import apiClient from "../../services/apiClient";
import { getUserById, updateUser } from '../../services/userService';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import "../../assets/styles/UserCSS/UserProfile.css";
import { useNavigate } from "react-router-dom";

const extractQuotedMessage = (errorMessage) => {
  const match = errorMessage.match(/"([^"]+)"/);
  return match ? match[1] : errorMessage;
};

const extractFieldErrors = (data) => {
  const errors = {};
  if (data && typeof data === 'object') {
    Object.entries(data).forEach(([key, msg]) => {
      if (typeof msg === 'string') errors[key] = msg;
    });
  }
  return errors;
};

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ username: '', phone: '', email: '' });
  const [fieldErrors, setFieldErrors] = useState({});
  const [imageError, setImageError] = useState(false);
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
      setProfile(userData);
      setImageError(false); // Reset image error
    } catch (err) {
      const msg = err.response?.data?.message || 'Lỗi khi tải thông tin người dùng';
      setError(extractQuotedMessage(msg));
      toast.error(extractQuotedMessage(msg));
    }
  }, []);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  // LOG: Khi avatar thay đổi
  useEffect(() => {
    if (profile?.avatar) {
      console.log('Avatar URL (DB):', profile.avatar);
      setImageError(false); // Reset khi có URL mới
    }
  }, [profile?.avatar]);

  // Cập nhật form khi profile load
  useEffect(() => {
    if (profile) {
      setEditForm({
        username: profile.username || '',
        phone: profile.phone || '',
        email: profile.email || ''
      });
    }
  }, [profile]);

  // UPLOAD AVATAR – ĐÃ SỬA
  const handleUploadAvatar = async () => {
    if (!selectedImage) return;

    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user?.userId) {
        toast.error('Không tìm thấy thông tin người dùng');
        return;
      }

      const formData = new FormData();
      const blob = await fetch(selectedImage).then(r => r.blob());
      formData.append('avatar', blob, 'avatar.jpg');

      console.log('Uploading avatar...');

      const res = await apiClient.post(`/user/avatar`, formData);

      console.log('Upload success:', res.data);

      // RELOAD PROFILE TỪ DB ĐỂ ĐẢM BẢO DỮ LIỆU MỚI NHẤT
      await fetchProfile();

      setShowAvatarModal(false);
      setSelectedImage(null);
      fileInputRef.current.value = '';
      
      toast.success('Cập nhật ảnh đại diện thành công!');
    } catch (err) {
      console.error('Upload error:', err);
      const msg = err.response?.data?.message || 'Có lỗi xảy ra khi upload ảnh đại diện';
      toast.error(extractQuotedMessage(msg));
    }
  };

  const handleAvatarClick = () => fileInputRef.current?.click();

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setSelectedImage(ev.target.result);
        setShowAvatarModal(true);
      };
      reader.readAsDataURL(file);
    } else {
      toast.error('Vui lòng chọn file hình ảnh');
    }
  };

  // XỬ LÝ LỖI ẢNH
  const handleImageError = () => {
    console.error('Avatar image failed to load:', profile?.avatar);
    setImageError(true);
  };

  const getInitials = (name) => name ? name.charAt(0).toUpperCase() : 'U';

  // HIỂN THỊ PLACEHOLDER NẾU: không có avatar HOẶC ảnh lỗi
  const showPlaceholder = !profile?.avatar || imageError;

  const handleEdit = () => setIsEditing(true);

  const handleCancelEdit = () => {
    setIsEditing(false);
    setFieldErrors({});
    setEditForm({
      username: profile.username || '',
      phone: profile.phone || '',
      email: profile.email || ''
    });
  };

  const handleSaveEdit = async () => {
    setFieldErrors({});

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
      const data = err.response?.data;

      if (data && typeof data === 'object') {
        const fieldErrs = extractFieldErrors(data);
        if (Object.keys(fieldErrs).length) {
          setFieldErrors(fieldErrs);
          const firstMsg = Object.values(fieldErrs)[0];
          toast.error(firstMsg);
          return;
        }
      }

      const generic = data?.message || 'Lỗi khi cập nhật thông tin';
      toast.error(extractQuotedMessage(generic));
    }
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditForm(p => ({ ...p, [name]: value }));
  };

  if (error) return <div className="profile-container error">{error}</div>;
  if (!profile) return <div className="profile-container loading">Đang tải thông tin...</div>;

  return (
    <div className="profile-container">
      <ToastContainer hideProgressBar={true} />

      <div className="profile-header">
        <div className="avatar-section">
          <div className="avatar-container" onClick={handleAvatarClick}>
            {/* ẢNH ĐẠI DIỆN – CÓ KEY + CACHE BUSTER + ONERROR */}
            {profile.avatar && !showPlaceholder && (
              <img 
                key={profile.avatar}
                src={`${profile.avatar}?t=${Date.now()}`}
                alt="Avatar" 
                className="avatar-image"
                onLoad={() => console.log('Avatar LOADED:', profile.avatar)}
                onError={handleImageError}
              />
            )}
            
            {/* PLACEHOLDER */}
            <div 
              className="avatar-placeholder"
              style={{ display: showPlaceholder ? "flex" : "none" }}
            >
              {getInitials(profile.displayName || profile.username)}
            </div>
            
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

      <div className="profile-section">
        <div className="section-header">
          <h2>Thông tin cá nhân</h2>
          {!isEditing ? (
            <button className="btn-edit" onClick={handleEdit}>Chỉnh sửa</button>
          ) : (
            <div className="edit-actions">
              <button className="profile-btn-cancel" onClick={handleCancelEdit}>Hủy</button>
              <button className="profile-btn-save" onClick={handleSaveEdit}>Lưu</button>
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
                className={fieldErrors.username ? 'input-error' : ''}
              />
              {fieldErrors.username && <span className="error-message">{fieldErrors.username}</span>}
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={editForm.email}
                onChange={handleEditFormChange}
                className={fieldErrors.email ? 'input-error' : ''}
              />
              {fieldErrors.email && <span className="error-message">{fieldErrors.email}</span>}
            </div>

            <div className="form-group">
              <label>Số điện thoại</label>
              <input
                type="tel"
                name="phone"
                value={editForm.phone}
                onChange={handleEditFormChange}
                className={fieldErrors.phone ? 'input-error' : ''}
              />
              {fieldErrors.phone && <span className="error-message">{fieldErrors.phone}</span>}
            </div>
          </div>
        )}
      </div>

      <div className="password-section">
        <h2>Mật Khẩu và Xác Thực</h2>
        <button className="btn-change-password" onClick={() => navigate('/password-change')}>
          Đổi Mật Khẩu
        </button>
      </div>

      {/* MODAL XÁC NHẬN ẢNH */}
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