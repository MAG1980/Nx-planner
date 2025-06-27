import { Controller, Get } from '@nestjs/common';
import { SkipAuth } from '@api/auth/decorators/skip-auth.decorator';

@Controller('users')
export class UsersController {
  @SkipAuth()
  @Get('test')
  getTest() {
    console.log('test');
    return 'test';
  }
}
