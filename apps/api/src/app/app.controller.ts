import {Controller, Get, Query} from '@nestjs/common';
import {AppService} from "@api/app/app.service";
import {CreateUserDto} from "@shared-types";

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {
  }

  @Get()
  getData(@Query() user:CreateUserDto) {
    return this.appService.getData(user);
  }
}
