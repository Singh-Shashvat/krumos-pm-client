import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('krumos_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    // If the response is wrapped in our standard AppResponse envelope, unpack the inner data.
    if (
      response.data &&
      typeof response.data === 'object' &&
      'success' in response.data
    ) {
      if (response.data.success) {
        response.data = response.data.data;
      } else {
        return Promise.reject(
          response.data.error || new Error('Request failed')
        );
      }
    }
    return response;
  },
  (error) => {
    // If the error response is wrapped in the AppResponse envelope, extract standard error details.
    if (
      error.response &&
      error.response.data &&
      typeof error.response.data === 'object' &&
      'success' in error.response.data
    ) {
      const appError = error.response.data.error;
      if (appError) {
        error.message = appError.message || error.message;
        error.code = appError.code || error.code;
        error.response.data = appError;
      }
    }
    return Promise.reject(error);
  }
);

export default api;
export { API_BASE_URL };
