import { ReactNode, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { JwtPayload } from '@shared-types';
import { jwtDecode } from 'jwt-decode';
import Cookies from 'js-cookie';
import { AuthContext } from '@web/contexts/auth.context';
import api, {
  setAxiosAccessToken,
  setAxiosUnauthorizedHandler,
  setRefreshFailed,
} from '@web/lib/api';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<JwtPayload | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const router = useRouter();

  // Обновляем токен в Axios при изменении
  useEffect(() => {
    setAxiosAccessToken(accessToken);
  }, [accessToken]);

  const refreshToken = useCallback(async () => {
    try {
      const response = await api.post(
        '/api/auth/refresh',
        {},
        { withCredentials: true }
      );
      const { accessToken } = response.data;
      setAccessToken(accessToken);

      const jwtPayload = jwtDecode(accessToken) as unknown as JwtPayload;
      setUser({
        sub: jwtPayload.sub,
        name: jwtPayload.name,
        email: jwtPayload.email,
      });
      return accessToken;
    } catch (error) {
      setUser(null);
      setAccessToken(null);
      Cookies.remove('refresh_token');
      router.push('/login');
      throw error;
    }
  }, [router]);

  // Устанавливаем обработчик для 401 ошибок
  useEffect(() => {
    // Передаём callback refreshToken
    setAxiosUnauthorizedHandler(refreshToken);
  }, [refreshToken]);

  const login = async (email: string, password: string) => {
       const response = await api.post(
        '/api/auth/login',
        { email, password },
        { withCredentials: true }
      );
      const { accessToken } = response.data;
      setAccessToken(accessToken);

      const jwtPayload = jwtDecode(accessToken) as unknown as JwtPayload;
      setUser({
        sub: jwtPayload.sub,
        name: jwtPayload.name,
        email: jwtPayload.email,
      });

      // Сбрасываем флаг при успешном логине
      setRefreshFailed(false);
  };

  const logout = async () => {
    try {
      await api.post('api/auth/logout', {}, { withCredentials: true });
    } finally {
      setUser(null);
      setAccessToken(null);
      Cookies.remove('refresh_token');
      router.push('/login');
    }
  };

  const value = {
    user,
    accessToken,
    login,
    logout,
    refreshToken,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
