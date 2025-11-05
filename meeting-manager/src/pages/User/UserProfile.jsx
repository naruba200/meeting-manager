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

// Helper: Compress image using canvas (max 800px, 80% quality)
const compressImage = (file, maxSize = 800, quality = 0.8) => {
  // Skip compression for GIFs to preserve animation
  if (file.type === 'image/gif') {
    return Promise.resolve(file); // return original File/Blob
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);

    img.onload = () => {
      let { width, height } = img;

      if (width > maxSize || height > maxSize) {
        const ratio = width > height ? maxSize / width : maxSize / height;
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Compression failed'));
        },
        file.type.includes('png') ? 'image/png' : 'image/jpeg', // preserve PNG transparency
        quality
      );
    };

    img.onerror = reject;
  });
};

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null); // data URL string
  const [compressedBlob, setCompressedBlob] = useState(null); // compressed Blob
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ username: '', phone: '', email: '' });
  const [fieldErrors, setFieldErrors] = useState({});
  const [imageError, setImageError] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const fetchProfile = useCallback(async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (!user?.userId) {
        setError('Không tìm thấy thông tin người dùng');
        return;
      }
      const userData = await getUserById(user.userId);
      setProfile(userData);
      setImageError(false);
    } catch (err) {
      const msg = err.response?.data?.message || 'Lỗi khi tải thông tin người dùng';
      setError(extractQuotedMessage(msg));
      toast.error(extractQuotedMessage(msg));
    }
  }, []);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  useEffect(() => {
    if (profile?.avatar) {
      console.log('Avatar URL (DB):', profile.avatar);
      setImageError(false);
    }
  }, [profile?.avatar]);

  useEffect(() => {
    if (profile) {
      setEditForm({
        username: profile.username || '',
        phone: profile.phone || '',
        email: profile.email || ''
      });
    }
  }, [profile]);

  // Clean up object URL
  useEffect(() => {
    return () => {
      if (selectedImage) {
        URL.revokeObjectURL(selectedImage);
      }
    };
  }, [selectedImage]);

  // UPLOAD AVATAR – Uses compressed blob
  const handleUploadAvatar = async () => {
    if (!compressedBlob) {
      toast.error('Không có ảnh để upload');
      return;
    }

    setIsUploading(true);
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (!user?.userId) {
        toast.error('Không tìm thấy thông tin người dùng');
        return;
      }

      const formData = new FormData();
      formData.append('avatar', compressedBlob, 'avatar.jpg');

      console.log('Uploading compressed avatar...');
      const res = await apiClient.post(`/user/avatar`, formData);

      console.log('Upload success:', res.data);

      await fetchProfile();

      setShowAvatarModal(false);
      setSelectedImage(null);
      setCompressedBlob(null);
      if (fileInputRef.current) fileInputRef.current.value = '';

      toast.success('Cập nhật ảnh đại diện thành công!');
      window.parent.postMessage('avatarUpdated', '*');
    } catch (err) {
      console.error('Upload error:', err);
      const msg = err.response?.data?.message || 'Có lỗi xảy ra khi upload ảnh đại diện';
      toast.error(extractQuotedMessage(msg));
    } finally {
      setIsUploading(false);
    }
  };

  const handleAvatarClick = () => fileInputRef.current?.click();

  // Handle file selection + compress
  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn file hình ảnh');
      return;
    }

    try {
      let processedBlob;
      let previewUrl;

      if (file.type === 'image/gif') {
        // GIF: Use original file, generate preview via Object URL
        processedBlob = file;
        previewUrl = URL.createObjectURL(file);
      } else {
        // Other images: Compress
        processedBlob = await compressImage(file, 800, 0.8);
        previewUrl = URL.createObjectURL(processedBlob);
      }

      setSelectedImage(previewUrl);
      setCompressedBlob(processedBlob);
      setShowAvatarModal(true);
    } catch (err) {
      console.error('Image processing failed:', err);
      toast.error('Không thể xử lý ảnh, vui lòng thử lại');
    }
  };

  const handleImageError = () => {
    console.error('Avatar image failed to load:', profile?.avatar);
    setImageError(true);
  };

  const getInitials = (name) => name ? name.charAt(0).toUpperCase() : 'U';

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
      const user = JSON.parse(localStorage.getItem('user') || '{}');
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
              {selectedImage && <img src={selectedImage} alt="Preview" />}
            </div>
            <div className="avatar-actions">
              <button
                className="btn-cancel"
                onClick={() => {
                  setShowAvatarModal(false);
                  setSelectedImage(null);
                  setCompressedBlob(null);
                  if (selectedImage) URL.revokeObjectURL(selectedImage);
                }}
              >
                Hủy
              </button>
              <button 
                className="btn-upload" 
                onClick={handleUploadAvatar}
                disabled={isUploading}
              >
                {isUploading ? 'Đang tải...' : 'Xác nhận'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL LOADING */}
      {isUploading && (
        <div className="loading-overlay">
          <div className="spinner"></div>
        </div>
      )}
    </div>
  );
}