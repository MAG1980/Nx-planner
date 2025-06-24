import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { Response } from 'express';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { CreateUserDto } from '@shared-types';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockResponse = {
    cookie: jest.fn(),
    clearCookie: jest.fn(),
  } as unknown as Response;

  beforeEach(async () => {
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
        {
          httpOnly: true,
          secure: false,
          sameSite: 'lax',
          maxAge: 7 * 24 * 60 * 60 * 1000,
        }
      );
      expect(result).toEqual({ accessToken: 'access-token' });
    });
  });

  describe('login', () => {
    it('should login user and return access token', async () => {
      const mockUser = {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
      };

      const mockTokens = {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      };

      jest.spyOn(authService, 'login').mockResolvedValue(mockTokens);

      const mockRequest = {
        user: mockUser,
      };

      const result = await controller.login(mockRequest as any, mockResponse);

      expect(authService.login).toHaveBeenCalledWith(mockUser);
      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'refresh_token',
        'refresh-token',
        {
          httpOnly: true,
          secure: false,
          sameSite: 'lax',
          maxAge: 7 * 24 * 60 * 60 * 1000,
        }
      );
      expect(result).toEqual({ accessToken: 'access-token' });
    });
  });

  describe('logout', () => {
    it('should logout user and clear refresh token cookie', async () => {
      const mockUser = {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
      };

      const mockRequest = {
        user: mockUser,
      };

      jest.spyOn(authService, 'logout').mockResolvedValue(undefined);

      await controller.logout(mockRequest as any, mockResponse);

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
      };

      jest.spyOn(authService, 'refreshTokens').mockResolvedValue(mockTokens);

      const result = await controller.refreshTokens(
        mockRequest as any,
        mockResponse
      );

      expect(authService.refreshTokens).toHaveBeenCalledWith(
        '1',
        'old-refresh-token'
      );
      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'refresh_token',
        'new-refresh-token',
        {
          httpOnly: true,
          secure: false,
          sameSite: 'lax',
          maxAge: 7 * 24 * 60 * 60 * 1000,
        }
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
});
