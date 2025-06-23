import { UserPayload } from '@api/auth/types/user-payload.type';

export type JwtRefreshPayload = UserPayload & {
  refreshToken: string;
};
