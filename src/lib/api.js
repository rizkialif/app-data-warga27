import axios from 'axios';
import { message } from 'antd';

const api = axios.create({
  baseURL: '/',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: Attach access token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Handle expired tokens
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Check if error is 401 and it's because token expired
    if (error.response?.status === 401 && !originalRequest._retry) {
      const message = error.response.data?.message;

      if (message === 'Access token expired') {
        originalRequest._retry = true;

        try {
          const refreshToken = localStorage.getItem('refreshToken');
          if (!refreshToken) throw new Error('No refresh token available');

          const res = await axios.post('/api/auth/refresh-token', { refreshToken });

          if (res.status === 200) {
            const newAccessToken = res.data.data.accessToken;
            localStorage.setItem('accessToken', newAccessToken);

            // Retry original request with new token
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return api(originalRequest);
          }
        } catch (refreshError) {
          // If refresh fails, logout
          localStorage.clear();
          sessionStorage.setItem('logoutReason', 'session_expired');
          message.error('Sesi anda sudah berakhir, silahkan login ulang');
          setTimeout(() => {
            window.location.href = '/login';
          }, 2000);
          return Promise.reject(refreshError);
        }
      }
      
      // If unauthorized but not due to expiry (e.g. invalid token), logout too
      if (error.response.data?.message === 'Access token required' || error.response.data?.message === 'Access token malformed or invalid signature') {
        localStorage.clear();
        sessionStorage.setItem('logoutReason', 'invalid_session');
        message.error('Sesi anda sudah berakhir, silahkan login ulang');
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
