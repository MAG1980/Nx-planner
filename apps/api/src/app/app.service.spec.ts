import { Test } from '@nestjs/testing';
import { AppService } from './app.service';
import { CreateUserDto } from '@shared-types';

describe('AppService', () => {
  let service: AppService;

  beforeAll(async () => {
    const app = await Test.createTestingModule({
      providers: [AppService],
    }).compile();

    service = app.get<AppService>(AppService);
  });

  describe('getData', () => {
    const createUserDto: CreateUserDto = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
    };
    it('should return "Hello Test User"', () => {
      expect(service.getData(createUserDto)).toEqual({
        message: `Hello ${createUserDto.name}!`,
      });
    });
  });
});
