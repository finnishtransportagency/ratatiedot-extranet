import axios from 'axios';

// Track if we're already redirecting to avoid multiple redirects
let isRedirecting = false;

export const setupAxiosInterceptors = () => {
  // Request interceptor - could be used for adding auth headers if needed
  axios.interceptors.request.use(
    (config) => {
      return config;
    },
    (error) => {
      return Promise.reject(error);
    },
  );

  // Response interceptor to handle authentication errors
  axios.interceptors.response.use(
    (response) => {
      return response;
    },
    (error) => {
      // Handle 401 Unauthorized errors
      if (error.response?.status === 401 && !isRedirecting) {
        isRedirecting = true;

        // Clear any existing cookies to ensure clean state
        document.cookie = 'Return=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';

        // Redirect to SSO logout which will trigger a fresh login
        window.location.href = `${window.location.origin}/sso/logout?auth=1`;

        return Promise.reject(error);
      }

      return Promise.reject(error);
    },
  );
};

// Reset redirect flag when needed
export const resetRedirectFlag = () => {
  isRedirecting = false;
};
