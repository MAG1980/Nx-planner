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

// Добавляем возможность контроля и управления состоянием попытки обновления токенов в AuthProvider.
let refreshFailed = false
export const setRefreshFailed = (state: boolean) => {
  refreshFailed = state;
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

    // Если это 401 ошибка и запрос еще не повторялся
    if (error.response?.status === 401 && !originalRequest._retry) {

      // Если предыдущее обновление токена уже провалилось, не пытаемся снова
      if (refreshFailed) {
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      try {
        if (onUnauthorized) {
          await onUnauthorized();
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Помечаем, что обновление токена провалилось
        refreshFailed = true;

        return Promise.reject(refreshError);
      }
    }

    // Для всех других ошибок или если запрос уже повторялся
    return Promise.reject(error);
  }
);

export default api;
