import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from '@api/app/app.controller';
import { AppService } from '@api/app/app.service';
import { CreateUserDto } from '@shared-types';

describe('AppController', () => {
  let app: TestingModule;

  beforeAll(async () => {
    app = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();
  });

  describe('getData', () => {
    const createUserDto: CreateUserDto = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
    };
    it('should return "Hello Test User"', () => {
      const appController = app.get<AppController>(AppController);
      expect(appController.getData(createUserDto)).toEqual({
        message: `Hello ${createUserDto.name}!`,
      });
    });
  });
});
