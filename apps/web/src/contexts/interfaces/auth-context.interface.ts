import { AuthState } from '@web/contexts/interfaces/auth-state.interface';
import { Dispatch, SetStateAction } from 'react';

export interface AuthContextInterface {
  authState: AuthState;
  setAuthState: Dispatch<SetStateAction<AuthState>> | null;
  isAuthenticated: () => boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}
