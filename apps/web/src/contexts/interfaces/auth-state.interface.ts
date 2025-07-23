import { AxiosInstance } from 'axios';
import { JwtPayload } from '@shared-types';

export interface AuthState {
  accessToken: string | null;
  api: AxiosInstance | null;
  user: JwtPayload | null;
}
