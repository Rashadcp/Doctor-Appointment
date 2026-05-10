import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Required for sending/receiving cookies
});

// Request interceptor to add the access token
api.interceptors.request.use(
  (config) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Call the refresh endpoint
        const response = await axios.get(`${API_URL}/auth/refresh`, {
          withCredentials: true,
        });

        const { accessToken } = response.data;
        
        // Store the new access token
        localStorage.setItem('accessToken', accessToken);

        // Update the original request's authorization header
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;

        // Retry the original request
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, clear tokens and redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
