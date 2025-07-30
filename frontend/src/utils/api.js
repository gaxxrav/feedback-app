import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
  baseURL: 'http://localhost:8001/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth tokens if needed
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle common errors here
    if (error.response?.status === 401) {
      // Handle unauthorized
      console.log('Unauthorized access');
    } else if (error.response?.status === 404) {
      // Handle not found
      console.log('Resource not found');
    }
    return Promise.reject(error);
  }
);

export default api; 