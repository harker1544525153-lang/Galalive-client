import axios from 'axios';

const getApiBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  
  if (envUrl && (envUrl.startsWith('http://') || envUrl.startsWith('https://'))) {
    return envUrl;
  }
  
  if (window.location.hostname === 'localhost') {
    return '/api';
  }
  
  return 'https://galalive-backend.vercel.app/api';
};

const api = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 10000,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
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
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      const path = window.location.pathname;
      const base = path.startsWith('/Galalive-client') ? '/Galalive-client' : '';
      window.location.href = `${base}/login`;
    }
    return Promise.reject(error);
  }
);

export default api;