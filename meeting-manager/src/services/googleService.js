import apiClient from './apiClient';

/**
 * Gets the Google authentication URL from the backend.
 */
export const getGoogleAuthUrl = async () => {
  const response = await apiClient.get('/google/auth-url');
  return response.data;
};

/**
 * Gets the user's Google email from the backend.
 */
export const getGoogleEmail = async () => {
  try {
    const response = await apiClient.get('/google/email');
    return response.data;
  } catch (error) {
    // Handle cases where the user hasn't linked their Google account
    if (error.response && error.response.status === 404) {
      return null;
    }
    // Re-throw other errors
    throw error;
  }
};
