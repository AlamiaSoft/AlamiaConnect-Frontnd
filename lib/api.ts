import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1',
  withCredentials: true,
  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',
  headers: {
    'Accept': 'application/vnd.api+json',
    'Content-Type': 'application/vnd.api+json',
    'X-Requested-With': 'XMLHttpRequest', // Important for Sanctum to recognize AJAX
  },
});

// Request interceptor: Add auth token to requests
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

import { toast } from 'sonner';

// Response interceptor: Handle token expiration and errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { response } = error;
    const status = response?.status;

    // Handle 401 Unauthorized (token expired or invalid)
    if (status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');

        // Only redirect if not already on login page
        if (window.location.pathname !== '/login') {
          toast.error('Session expired. Please login again.');
          window.location.href = '/login';
        }
      }
    }

    // Handle 403 Forbidden
    else if (status === 403) {
      toast.error(response?.data?.message || 'You do not have permission to perform this action.');
    }

    // Handle 422 Validation Error
    else if (status === 422) {
      // Typically handled by the form, but we can log it or show a summary toast
      const errors = response?.data?.errors;
      if (errors && typeof errors === 'object') {
        // For JSON:API errors array
        if (Array.isArray(errors)) {
          toast.error(errors[0].detail || 'Validation error');
        } else {
          // For legacy Laravel validation object
          const firstError = Object.values(errors)[0];
          toast.error(Array.isArray(firstError) ? firstError[0] : 'Validation error');
        }
      }
    }

    // Handle 429 Too Many Requests
    else if (status === 429) {
      toast.error('Too many requests. Please try again later.');
    }

    // Handle 500+ Server Error
    else if (status >= 500) {
      toast.error('A server error occurred. Please contact support.');
      console.error('Server error:', response?.data);
    }

    return Promise.reject(error);
  }
);

export default api;
