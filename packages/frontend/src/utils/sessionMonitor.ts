import axios from 'axios';

let sessionCheckInterval: NodeJS.Timeout | null = null;
let windowFocusHandler: (() => void) | null = null;

/**
 * Performs a lightweight check to see if the user session is still valid
 */
export const checkSessionHealth = async (): Promise<boolean> => {
  try {
    // Use a lightweight endpoint to check if the session is valid
    const response = await axios.get('/api/admin', { timeout: 5000 });
    return response.status === 200;
  } catch (error) {
    // If we get a 401, the session has expired
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      return false;
    }
    // For other errors, assume session is still valid (network issues, etc.)
    return true;
  }
};

/**
 * Handles session expiration by redirecting to login
 */
const handleSessionExpiration = () => {
  console.warn('Session has expired, redirecting to login');

  // Clear the Return cookie
  document.cookie = 'Return=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';

  // Redirect to SSO logout/login
  window.location.href = `${window.location.origin}/sso/logout?auth=1`;
};

/**
 * Starts periodic session health checks
 * @param intervalMinutes How often to check the session (default: 15 minutes)
 */
export const startSessionMonitoring = (intervalMinutes: number = 15) => {
  // Clear any existing interval
  if (sessionCheckInterval) {
    clearInterval(sessionCheckInterval);
  }

  // Set up periodic health checks
  sessionCheckInterval = setInterval(
    async () => {
      const isSessionValid = await checkSessionHealth();

      if (!isSessionValid) {
        handleSessionExpiration();
      }
    },
    intervalMinutes * 60 * 1000,
  ); // Convert minutes to milliseconds

  // Also check session when user returns to the browser window
  windowFocusHandler = async () => {
    const isSessionValid = await checkSessionHealth();
    if (!isSessionValid) {
      handleSessionExpiration();
    }
  };

  window.addEventListener('focus', windowFocusHandler);
  window.addEventListener('visibilitychange', () => {
    if (!document.hidden && windowFocusHandler) {
      windowFocusHandler();
    }
  });
};

/**
 * Stops session monitoring
 */
export const stopSessionMonitoring = () => {
  if (sessionCheckInterval) {
    clearInterval(sessionCheckInterval);
    sessionCheckInterval = null;
  }

  if (windowFocusHandler) {
    window.removeEventListener('focus', windowFocusHandler);
    window.removeEventListener('visibilitychange', windowFocusHandler);
    windowFocusHandler = null;
  }
};

/**
 * Manually trigger a session check
 */
export const triggerSessionCheck = async () => {
  const isValid = await checkSessionHealth();
  if (!isValid) {
    handleSessionExpiration();
  }
  return isValid;
};
