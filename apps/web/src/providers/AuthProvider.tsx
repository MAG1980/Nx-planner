import { ReactNode, useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { JwtPayload } from '@shared-types';
import { jwtDecode } from 'jwt-decode';
import Cookies from 'js-cookie';
import { AuthContext } from '@web/contexts/auth.context';
import { AuthState } from '@web/contexts/interfaces/auth-state.interface';
import axios, { AxiosError } from 'axios';

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [authState, setAuthState] = useState<AuthState>({
    accessToken: null,
    api: null,
    user: null,
  });

  useEffect(() => {
    const initializeAuth = async () => {
      const api = axios.create({
        // baseURL: process.env.NEXT_PUBLIC_API_URL,
        baseURL: '/',
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${authState.accessToken}`,
        },
      });

      api.interceptors.request.use(
        (config) => {
          if (authState.accessToken) {
            // config.headers['Authorization'] = `Bearer ${authState.accessToken}`;
            config.headers['Authorization'] = `Bearer ${authState.accessToken}`;
          }

          console.log(
            'Текущие заголовки запроса:',
            config.headers.Authorization
          );
          return config;
        },
        (error) => Promise.reject(error)
      );

      api.interceptors.response.use(
        (response) => response,
        async (error) => {
          // Сохраняем параметры оригинального запроса в переменную.
          const originalRequest = error.config;
          if (error.response?.status === 401 && !originalRequest._retry) {
            // Устанавливаем флаг для предотвращения бесконечного повторения запросов в случае неуспешной аутентификации.
            originalRequest._retry = true;

            try {
              // Обновляем access token используя refresh token из cookie
              const response = await axios.post(
                `api/auth/refresh`,
                {},
                {
                  // cookie прикрепляются к запросу благодаря этому свойству.
                  withCredentials: true,
                }
              );

              const newAccessToken = response.data.accessToken;
              originalRequest.headers[
                'Authorization'
              ] = `Bearer ${newAccessToken}`;
              setAuthState((prev) => ({
                ...prev,
                accessToken: newAccessToken,
              }));
              return api(originalRequest);
            } catch (refreshError) {
              // Если обновление токена не удалось, делаем логаут.
              await logout();
              return Promise.reject(refreshError);
            }
          }
          return Promise.reject(error);
        }
      );

      setAuthState((prev) => ({ ...prev, api }));
    };

    initializeAuth();
  }, []);

  useEffect(() => {
    const init = async () => {
      if (authState.api) {
        try {
          const response = await authState.api.post(
            `api/auth/refresh`,
            {},
            {
              withCredentials: true,
            }
          );
          setAuthState((prev) => ({
            ...prev,
            accessToken: response.data.accessToken,
          }));
        } catch (error) {
          // Пользователь не аутентифицирован
          setAuthState((prev) => ({ ...prev, accessToken: null, user: null }));
        }
      }
    };
    init();
  }, []);

  // При изменении accessToken декодируем его
  useEffect(() => {
    decodeAndSetUser(authState.accessToken);
  }, [authState.accessToken]);

  const decodeAndSetUser = (token: string | null) => {
    if (!token) {
      setAuthState((prev) => ({ ...prev, user: null }));
      return;
    }

    try {
      const decodedJwtPayload = jwtDecode<JwtPayload>(token);
      setAuthState((prev) => ({ ...prev, user: decodedJwtPayload }));
    } catch (error) {
      console.error('Failed to decode token:', error);
      setAuthState((prev) => ({ ...prev, user: null }));
    }
  };

  // Инициализация axios instance с интерцепторами
  useEffect(() => {
    if (authState.api) {
      authState.api.defaults.headers[
        'Authorization'
      ] = `Bearer ${authState.accessToken}`;
    }
  }, [authState.accessToken]);

  useEffect(() => {
    console.log('AccessToken refreshed: ', authState.accessToken);
  }, [authState.accessToken]);

  // Проверка аутентификации пользователя
  const isAuthenticated = () => {
    return authState.accessToken !== null && authState.user !== null;
  };

  const login = async (email: string, password: string) => {
    try {
      if (authState.api) {
        const response = await authState.api.post(
          '/api/auth/login',
          { email, password },
          { withCredentials: true }
        );
        const { accessToken } = response.data;
        setAuthState((prev) => ({ ...prev, accessToken }));
      }
    } catch (error) {
      console.log('Login failed: ', error);
      throw new Error(
        'Login failed because accessToken is not obtained: ',
        error as AxiosError
      );
    }
  };

  const logout = async () => {
    try {
      if (authState.api) {
        await authState.api.post(
          'api/auth/logout',
          {},
          {
            withCredentials: true,
            headers: {
              Authorization: `Bearer ${authState.accessToken}`,
            },
          }
        );
      }
    } catch (error) {
      console.error('Logout failed: ', error);
      throw new Error('Logout failed: ', error as AxiosError);
    } finally {
      setAuthState((prevState) => ({
        ...prevState,
        accessToken: null,
        user: null,
      }));
      Cookies.remove('refresh_token');
      router.push('/login');
    }
  };

  const value = {
    authState,
    setAuthState,
    isAuthenticated,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
