import React from 'react';
import '../assets/styles/ForgotPassword.css';

const ForgotPassword = () => {
  return (
    <div className="forgot-password-container">
      <form className="forgot-password-form">
        <h2>Forgot Password</h2>
        <p>Enter your email address and we will send you a link to reset your password.</p>
        <div className="input-group">
          <label htmlFor="email">Email</label>
          <input type="email" id="email" name="email" required />
        </div>
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default ForgotPassword;
