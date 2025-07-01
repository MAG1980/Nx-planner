import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AppService } from '@api/app/app.service';
import { CreateUserDto } from '@shared-types';
import { JwtAuthGuard } from '@api/auth/guards/jwt-auth.guard';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getData(@Query() user: CreateUserDto) {
    return this.appService.getData(user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('test-data')
  getTestData() {
    return 'test data';
  }
}
