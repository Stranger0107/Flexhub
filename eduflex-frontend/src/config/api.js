// frontend/src/config/api.js
import axios from 'axios';
import { toast } from 'react-toastify';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// ✅ Attach token to each request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Handle responses + global errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('currentUser');
      toast.error('Session expired. Please log in again.');
      setTimeout(() => (window.location.href = '/'), 1500);
    } else if (error.response) {
      const message = error.response.data?.message || 'An API error occurred';
      toast.error(message);
      console.error('API Error:', error.response.data);
    } else if (error.request) {
      toast.error('Network error. Please check your connection.');
      console.error('Network Error:', error.request);
    } else {
      toast.error('An unexpected error occurred.');
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default api;
export { API_BASE_URL };
