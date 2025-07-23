import { createContext } from 'react';
import { AuthContextInterface } from '@web/contexts/interfaces/auth-context.interface';

// Уже не используется. Оставил для образца.
/*const initialAuthContext: AuthContextInterface = {
  authState: {
    api: null,
    accessToken: null,
    user: null,
  },
  setAuthState: null,
  isAuthenticated: () => false,
  login: () => Promise.reject('Не подключен AuthProvider!'),
  logout: () => Promise.reject('Не подключен AuthProvider!'),
};*/

export const AuthContext = createContext<AuthContextInterface | undefined>(
  undefined
);
