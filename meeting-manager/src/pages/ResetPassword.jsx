import React from 'react';
import { useParams } from 'react-router-dom';
import '../assets/styles/ResetPassword.css';

const ResetPassword = () => {
  const { token } = useParams();

  return (
    <div className="reset-password-container">
      <form className="reset-password-form">
        <h2>Reset Password</h2>
        <p>Enter your new password.</p>
        <div className="input-group">
          <label htmlFor="password">New Password</label>
          <input type="password" id="password" name="password" required />
        </div>
        <div className="input-group">
          <label htmlFor="confirm-password">Confirm New Password</label>
          <input type="password" id="confirm-password" name="confirm-password" required />
        </div>
        <button type="submit">Reset Password</button>
      </form>
    </div>
  );
};

export default ResetPassword;
