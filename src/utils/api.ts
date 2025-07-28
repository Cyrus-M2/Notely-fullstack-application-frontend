import axios from 'axios';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 10000,
  withCredentials: false,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Always include token if available
    const token = Cookies.get('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      // Server responded with error status
      const message = error.response.data?.message || 'An error occurred';
      
      // Handle authentication errors
      if (error.response.status === 401) {
        // Clear invalid token
        Cookies.remove('token');
        delete api.defaults.headers.common['Authorization'];
        
        // Don't show toast for silent profile requests
        if (error.config.url === '/user/profile') {
          return Promise.reject(error);
        }
        
        // Redirect to login for other 401 errors
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
      
      // Show error toast for other errors
      if (error.response.status !== 422) { // Don't show toast for validation errors
        toast.error(message);
      }
    } else if (error.request) {
      // Network error
      toast.error('Network error. Please check your connection.');
    } else {
      // Other error
      toast.error('An unexpected error occurred.');
    }
    
    return Promise.reject(error);
  }
);

export default api;