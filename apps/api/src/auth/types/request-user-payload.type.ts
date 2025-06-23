import { Request } from 'express';
import { UserPayload } from '@api/auth/types/user-payload.type';

export type RequestUserPayload = Request & { user: UserPayload };
