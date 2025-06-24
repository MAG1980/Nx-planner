import { JwtPayload } from '@shared-types';

export interface AuthContextInterface {
  user: JwtPayload | null;
  accessToken: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  isAuthenticated: boolean;
}
