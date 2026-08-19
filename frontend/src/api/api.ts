import axios from 'axios';
import type { QueueItem } from '../types';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  headers: { 'Content-Type': 'application/json' },
});

export const setAuthToken = (token: string) => {
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
};

export const removeAuthToken = () => {
  delete api.defaults.headers.common['Authorization'];
};

let isRefreshing = false;
let failedQueue: QueueItem[] = [];

const processQueue = (error: unknown | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token as string);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    if (originalRequest.url?.includes('/token/refresh/')) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      removeAuthToken();
      window.location.href = '/login';
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          originalRequest.headers['Authorization'] = `Bearer ${token}`;
          return api(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    const refresh = localStorage.getItem('refresh_token');

    if (!refresh) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      removeAuthToken();
      window.location.href = '/login';
      isRefreshing = false;
      return Promise.reject(error);
    }

    try {
      const { data } = await axios.post(
        `${api.defaults.baseURL}/api/token/refresh/`,
        { refresh }
      );

      if (data.access) {
        localStorage.setItem('access_token', data.access);
        setAuthToken(data.access);
      }

      if (data.refresh) {
        localStorage.setItem('refresh_token', data.refresh);
      }

      processQueue(null, data.access);
      originalRequest.headers['Authorization'] = `Bearer ${data.access}`;
      return api(originalRequest);
    } catch (refreshError) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      removeAuthToken();
      processQueue(refreshError, null);
      window.location.href = '/login';
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);