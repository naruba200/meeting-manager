import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { forgotPassword } from '../services/authService';
import '../assets/styles/ForgotPassword.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate(); // Initialize useNavigate

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');
    setError('');

    try {
      const response = await forgotPassword(email); // Capture the response
      console.log('Forgot password request successful. Response:', response); // Log the response
      setMessage('An OTP code has been sent to your email address.');
      setTimeout(() => {
        navigate('/reset-password'); // Redirect to reset password page
      }, 3000); // Redirect after 3 seconds
    } catch (err) {
      setError(err.message || 'Failed to send reset link. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="forgot-password-container">
      <form className="forgot-password-form" onSubmit={handleSubmit}>
        <h2>Forgot Password</h2>
        <p>Enter your email address and we will send you a link to reset your password.</p>
        {message && <p className="success-message">{message}</p>}
        {error && <p className="error-message">{error}</p>}
        <div className="input-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Sending...' : 'Submit'}
        </button>
      </form>
    </div>
  );
};

export default ForgotPassword;
