import axios from 'axios';

const api = axios.create({
  // baseURL: '/api',
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
  withCredentials: true,
});

// Добавляем возможность обновлять токен
let currentAccessToken: string | null = null;
let onUnauthorized: (() => Promise<void>) | null = null;

// Получение текущего значения accessToken из state AuthProvider.
export const setAxiosAccessToken = (token: string | null) => {
  currentAccessToken = token;
};

// Используется для вызова функции refreshToken() из AuthProvider.
export const setAxiosUnauthorizedHandler = (handler: () => Promise<void>) => {
  onUnauthorized = handler;
};

api.interceptors.request.use((config) => {
  if (currentAccessToken) {
    config.headers.Authorization = `Bearer ${currentAccessToken}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        if (onUnauthorized) {
          await onUnauthorized();
          return api(originalRequest);
        }
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
