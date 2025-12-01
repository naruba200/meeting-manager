import React, { useEffect, useState, useRef, useCallback } from "react";
import apiClient from "../../services/apiClient";
import { getGoogleAuthUrl, getGoogleEmail } from '../../services/googleService';
import { getUserById, updateUser } from '../../services/userService';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import "../../assets/styles/UserCSS/UserProfile.css";
import { useNavigate } from "react-router-dom";
import { FaGoogle } from 'react-icons/fa';

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
  const [googleBoundEmail, setGoogleBoundEmail] = useState(null); // New state for Google email
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const fetchProfile = useCallback(async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (!user?.userId) {
        setError('User information not found');
        return;
      }
      const userData = await getUserById(user.userId);
      setProfile(userData);
      setImageError(false);

      // Fetch Google email status
      const email = await getGoogleEmail();
      setGoogleBoundEmail(email);

    } catch (err) {
      const msg = err.response?.data?.message || 'Error loading user information';
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

  useEffect(() => {
    const channel = new BroadcastChannel('google-auth');

    const handleAuthSuccess = (event) => {
      if (event.data === 'success') {
        toast.success('Google account linked successfully!');
        fetchProfile();
      }
    };

    channel.addEventListener('message', handleAuthSuccess);

    return () => {
      channel.removeEventListener('message', handleAuthSuccess);
      channel.close();
    };
  }, [fetchProfile]);

  // UPLOAD AVATAR – Uses compressed blob
  const handleUploadAvatar = async () => {
    if (!compressedBlob) {
      toast.error('No image to upload');
      return;
    }

    setIsUploading(true);
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (!user?.userId) {
        toast.error('User information not found');
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

      toast.success('Profile picture updated successfully!');
      window.parent.postMessage('avatarUpdated', '*');
    } catch (err) {
      console.error('Upload error:', err);
      const msg = err.response?.data?.message || 'An error occurred while uploading the profile picture';
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
      toast.error('Please select an image file');
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
      toast.error('Unable to process the image, please try again');
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
      toast.error("All fields must be filled in");
      return;
    }
    if (
      editForm.username === profile.username &&
      editForm.email === profile.email &&
      editForm.phone === profile.phone
    ) {
      toast.error("No changes to save");
      return;
    }

    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      await updateUser(user.userId, editForm);
      toast.success('Information updated successfully!');
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

      const generic = data?.message || 'Error updating information';
      toast.error(extractQuotedMessage(generic));
    }
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditForm(p => ({ ...p, [name]: value }));
  };

  const handleBindGoogle = async () => {
    try {
      const authUrl = await getGoogleAuthUrl();
      window.open(authUrl, 'GoogleAuth', 'width=600,height=700');
    } catch (error) {
      console.error('Error getting Google auth URL:', error);
      toast.error('Could not initiate Google account binding. Please try again.');
    }
  };

  if (error) return <div className="profile-container error">{error}</div>;
  if (!profile) return <div className="profile-container loading">Loading information...</div>;

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
            Change profile picture
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
          <p>Welcome back!</p>
        </div>
      </div>

      <div className="profile-section">
        <div className="section-header">
          <h2>Personal information</h2>
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
                <span className="item-label">Display name</span>
                <span className="item-value">{profile.username || 'Not updated'}</span>
              </div>
            </div>
            <div className="profile-item">
              <div className="item-info">
                <span className="item-label">Email</span>
                <span className="item-value">{profile.email || 'Not updated'}</span>
              </div>
            </div>
            <div className="profile-item">
              <div className="item-info">
                <span className="item-label">Phone number</span>
                <span className="item-value">{profile.phone || 'Not updated'}</span>
              </div>
            </div>
            <div className="profile-item">
              <div className="item-info">
                <span className="item-label">Bind account</span>
                {googleBoundEmail ? (
                  <span className="item-value">{googleBoundEmail.email}</span>
                ) : (
                  <button className="btn-bind-google" onClick={handleBindGoogle}>
                    <FaGoogle /> Google
                  </button>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="edit-form">
            <div className="form-group">
              <label>Display name</label>
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
              <label>Phone number</label>
              <input
                type="tel"
                name="phone"
                value={editForm.phone}
                onChange={handleEditFormChange}
                className={fieldErrors.phone ? 'input-error' : ''}
              />
              {fieldErrors.phone && <span className="error-message">{fieldErrors.phone}</span>}
            </div>

            <div className="form-group">
              <label>Bind Account</label>
              <div className="google-bind-container">
                {googleBoundEmail ? (
                  <>
                    <span className="bound-email">{googleBoundEmail.email}</span>
                    <button type="button" className="btn-rebind-google" onClick={handleBindGoogle}>
                      <FaGoogle /> Rebind
                    </button>
                  </>
                ) : (
                  <button type="button" className="btn-bind-google" onClick={handleBindGoogle}>
                    <FaGoogle /> Bind Google
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="password-section">
        <h2>Password and Authentication</h2>
        <button className="btn-change-password" onClick={() => navigate('/password-change')}>
          Change Password
        </button>
      </div>

      {/* MODAL XÁC NHẬN ẢNH */}
      {showAvatarModal && (
        <div className="avatar-modal-overlay">
          <div className="avatar-modal">
            <h3>Confirm new profile picture</h3>
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
                {isUploading ? 'Loading...' : 'Confirmation'}
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