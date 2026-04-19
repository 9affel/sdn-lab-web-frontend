import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://172.20.20.8:8000',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// ── Request Interceptor: Inject JWT Bearer Token ──
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('sdn_auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response Interceptor: Handle 401 Unauthorized ──
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('sdn_auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
