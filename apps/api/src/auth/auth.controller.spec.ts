import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { Response } from 'express';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { CreateUserDto } from '@shared-types';
import { UserPayload } from '@api/auth/types/user-payload.type';
import { Request } from 'express';
import { JwtRefreshPayload } from '@api/auth/types/jwt-refresh-payload.type';

interface CookieOptions {
  maxAge?: number;
  httpOnly?: boolean;
  secure?: boolean;
  path?: string;
  domain?: string;
  sameSite?: 'strict' | 'lax' | 'none';
}

interface CookieValue {
  value: string;
  options?: CookieOptions; // используем конкретный тип
}

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;
  let cookieValues: Record<string, CookieValue> = {};

  const mockResponse = {
    cookie: jest.fn(),
    clearCookie: jest.fn(),
  } as unknown as Response;

  let cookieMockResponse = {
    cookie: jest.fn((name: string, value: string, options?: CookieOptions) => {
      cookieValues[name] = { value, options };
    }),
    clearCookie: jest.fn((name: string) => {
      delete cookieValues[name];
    }),
  };

  beforeEach(async () => {
    cookieValues = {}; // Очищаем сохранённые cookie перед каждым тестом
    cookieMockResponse = {
      cookie: jest.fn(
        (name: string, value: string, options?: CookieOptions) => {
          cookieValues[name] = { value, options };
        }
      ),
      clearCookie: jest.fn((name: string) => {
        delete cookieValues[name];
      }),
    };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            signup: jest.fn(),
            login: jest.fn(),
            logout: jest.fn(),
            refreshTokens: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };

  const mockUser: UserPayload = {
    sub: '1',
    name: 'Test User',
    email: 'test@example.com',
  };

  const mockRequest = {
    user: mockUser,
  } as jest.Mocked<Request> & { user: UserPayload };

  describe('signup', () => {
    it('should create user and return access token', async () => {
      const createUserDto: CreateUserDto = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      };

      const mockUser = {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
      };

      const mockTokens = {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      };

      jest.spyOn(authService, 'signup').mockResolvedValue(mockUser);
      jest.spyOn(authService, 'login').mockResolvedValue(mockTokens);

      const result = await controller.signup(createUserDto, mockResponse);

      expect(authService.signup).toHaveBeenCalledWith(createUserDto);
      expect(authService.login).toHaveBeenCalledWith(mockUser);
      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'refresh_token',
        'refresh-token',
        { ...cookieOptions }
      );
      expect(result).toEqual({ accessToken: 'access-token' });
    });
  });

  describe('login', () => {
    it('should login user and return access token', async () => {
      const mockTokens = {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      };

      jest.spyOn(authService, 'login').mockResolvedValue(mockTokens);

      const result = await controller.login(mockRequest, mockResponse);

      expect(authService.login).toHaveBeenCalledWith(mockUser);
      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'refresh_token',
        'refresh-token',
        { ...cookieOptions }
      );
      expect(result).toEqual({ accessToken: 'access-token' });
    });
  });

  describe('logout', () => {
    it('should logout user and clear refresh token cookie', async () => {
      jest.spyOn(authService, 'logout').mockResolvedValue(undefined);

      await controller.logout(mockRequest, mockResponse);

      expect(authService.logout).toHaveBeenCalledWith('1');
      expect(mockResponse.clearCookie).toHaveBeenCalledWith('refresh_token');
    });
  });

  describe('refresh', () => {
    it('should refresh tokens and return new access token', async () => {
      const mockTokens = {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      };

      const mockRequest = {
        user: {
          id: '1',
          refreshToken: 'old-refresh-token',
        },
      } as unknown as jest.Mocked<Request> & { user: JwtRefreshPayload };

      jest.spyOn(authService, 'refreshTokens').mockResolvedValue(mockTokens);

      const result = await controller.refreshTokens(mockRequest, mockResponse);

      expect(authService.refreshTokens).toHaveBeenCalledWith(
        '1',
        'old-refresh-token'
      );
      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'refresh_token',
        'new-refresh-token',
        { ...cookieOptions }
      );
      expect(result).toEqual({ accessToken: 'new-access-token' });
    });
  });

  describe('guards', () => {
    it('login should use LocalAuthGuard', () => {
      const metadata = Reflect.getMetadata(
        '__guards__',
        AuthController.prototype.login
      );
      expect(metadata[0].name).toBe(LocalAuthGuard.name);
    });

    it('logout should use JwtAuthGuard', () => {
      const metadata = Reflect.getMetadata(
        '__guards__',
        AuthController.prototype.logout
      );
      expect(metadata[0].name).toBe(JwtAuthGuard.name);
    });

    it('refresh should use JwtRefreshGuard', () => {
      const metadata = Reflect.getMetadata(
        '__guards__',
        AuthController.prototype.refreshTokens
      );
      expect(metadata[0].name).toBe(JwtRefreshGuard.name);
    });
  });

  describe('status codes', () => {
    it('login should return 200 status code', () => {
      const metadata = Reflect.getMetadata(
        '__httpCode__',
        AuthController.prototype.login
      );
      expect(metadata).toBe(200);
    });

    it('logout should return 200 status code', () => {
      const metadata = Reflect.getMetadata(
        '__httpCode__',
        AuthController.prototype.logout
      );
      expect(metadata).toBe(200);
    });

    it('refresh should return 200 status code', () => {
      const metadata = Reflect.getMetadata(
        '__httpCode__',
        AuthController.prototype.refreshTokens
      );
      expect(metadata).toBe(200);
    });
  });

  describe('setRefreshTokenCookie', () => {
    it('should set refresh token cookie with correct value and options', () => {
      const refreshToken = 'test-refresh-token-123';

      // Вызываем приватный метод
      (controller as any).setRefreshTokenCookie(
        cookieMockResponse as unknown as Response,
        refreshToken
      );

      // Проверяем, что cookie был установлен
      expect(cookieMockResponse.cookie).toHaveBeenCalled();

      // Проверяем значение и параметры cookie
      expect(cookieValues['refresh_token']).toBeDefined();
      expect(cookieValues['refresh_token'].value).toBe(refreshToken);
      expect(cookieValues['refresh_token'].options).toEqual({
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
    });

    it('should set secure flag when in production', () => {
      const originalNodeEnv = process.env.NODE_ENV;

      try {
        process.env.NODE_ENV = 'production';
        const refreshToken = 'secure-token';

        (controller as any).setRefreshTokenCookie(
          cookieMockResponse as unknown as Response,
          refreshToken
        );

        expect(cookieValues['refresh_token'].options.secure).toBe(true);
      } finally {
        process.env.NODE_ENV = originalNodeEnv;
      }
    });
  });

  // Пример теста для logout, который проверяет очистку cookie
  describe('logout', () => {
    it('should clear refresh_token cookie', async () => {
      // Сначала устанавливаем cookie
      (controller as any).setRefreshTokenCookie(
        cookieMockResponse as unknown as Response,
        'test-token'
      );
      expect(cookieValues['refresh_token']).toBeDefined();

      // Мокируем authService.logout
      controller['authService'] = {
        logout: jest.fn().mockResolvedValue(undefined),
      } as any;

      // Мокируем request с user
      const mockRequest = {
        user: { id: 'user-id' },
      };

      // Вызываем logout
      await controller.logout(
        mockRequest as any,
        cookieMockResponse as unknown as Response
      );

      // Проверяем что cookie был очищен
      expect(cookieMockResponse.clearCookie).toHaveBeenCalledWith(
        'refresh_token'
      );
      expect(cookieValues['refresh_token']).toBeUndefined();
    });
  });
});
