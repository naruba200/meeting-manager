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

/**
 * Sends meeting data to the backend to sync with Google Calendar.
 * @param {object} meeting The meeting object to be synced.
 */
export const syncToGoogleCalendar = async (meeting) => {
  try {
    const response = await apiClient.post('/google/sync', meeting);
    return response.data;
  } catch (error) {
    // Check for 409 Conflict status
    if (error.response && error.response.status === 409) {
      // Token is expired, revoked, or not present. Redirect to Google auth.
      try {
        // Ask user for confirmation before redirecting
        if (window.confirm("Your Google account needs to be re-connected. Click OK to proceed to Google authentication.")) {
          const authUrl = await getGoogleAuthUrl();
          window.location.href = authUrl;
        }
        // Return a promise that never resolves to prevent further processing
        return new Promise(() => {});
      } catch (authError) {
        console.error("Could not get Google auth URL", authError);
        // If getting the auth URL fails, throw the original error
        throw error;
      }
    }
    // For other errors, re-throw to be handled by the component
    throw error;
  }
};


/**
 * Disconnects the user's Google account by clearing the token on the backend.
 * This endpoint needs to be created on the backend.
 */
export const disconnectGoogleAccount = async () => {
  // Assuming you have an endpoint like '/google/disconnect'
  const response = await apiClient.post('/google/disconnect');
  return response.data;
};

