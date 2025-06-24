import { createContext } from 'react';
import { AuthContextInterface } from '@web/contexts/interfaces/auth-context.interface';

const initialAuthContext: AuthContextInterface = {
  user: null,
  accessToken: null,
  isAuthenticated: false,
  refreshToken: () => Promise.reject('Не подключен AuthProvider!'),
  login: () => Promise.reject('Не подключен AuthProvider!'),
  logout: () => Promise.reject('Не подключен AuthProvider!'),
};

export const AuthContext =
  createContext<AuthContextInterface>(initialAuthContext);
