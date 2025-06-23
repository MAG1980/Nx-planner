import { Request } from 'express';
import { JwtRefreshPayload } from '@api/auth/types/jwt-refresh-payload.type';

export type RequestJwtRefreshPayload = Request & { user: JwtRefreshPayload };
