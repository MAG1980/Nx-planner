import { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useRouter } from 'next/router';
import { jwtDecode } from 'jwt-decode';
import { JwtPayload } from '@shared-types';
import { AuthContextInterface } from './interfaces/auth-context.interface';

const AuthContext = createContext<AuthContextInterface>(null!);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<JwtPayload | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        await refreshToken();
      } catch (error) {
        console.log('Not authenticated');
      }
    };
    initializeAuth();
  }, []);

  const refreshToken = async () => {
    try {
      const response = await axios.post(
        '/api/auth/refresh',
        {},
        { withCredentials: true }
      );
      const { accessToken } = response.data;
      setAccessToken(accessToken);

      // Декодируем JWT для получения информации о пользователе
      const jwtPayload = jwtDecode(accessToken) as unknown as JwtPayload;
      setUser({
        sub: jwtPayload.sub,
        name: jwtPayload.name,
        email: jwtPayload.email,
      });
    } catch (error) {
      console.error(
        'Ошибка при декодировании accessToken и обновлении данных пользователя:',
        error
      ); // Логирование
      throw new Error(
        'Не удалось декодировать accessToken. Данные пользователя не обновлены.'
      ); // Можно модифицировать ошибку
    }
  };

  const login = async (email: string, password: string) => {
    const response = await axios.post(
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
  };

  const logout = async () => {
    await axios.post('/api/auth/logout', {}, { withCredentials: true });
    setUser(null);
    setAccessToken(null);
    Cookies.remove('refresh_token');
    router.push('/login');
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

export function useAuth() {
  return useContext(AuthContext);
}
