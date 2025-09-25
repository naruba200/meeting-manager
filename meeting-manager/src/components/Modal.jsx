import React from 'react';
import '../assets/styles/Modal.css';

const Modal = ({ title, onClose, children }) => {
  const handleOverlayClick = (e) => {
    if (e.target.classList.contains('modal-overlay')) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-container">
        <div className="modal-header">
          <h2>{title}</h2>
          <span className="close-modal" onClick={onClose}>×</span>
        </div>
        <div className="modal-content">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
