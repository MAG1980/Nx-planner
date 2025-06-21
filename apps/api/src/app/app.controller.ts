import {Controller, Get, Query} from '@nestjs/common';
import {AppService} from './app.service';
import {CreateUserDto} from "@shared-types";

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {
  }

  @Get()
  getData(@Query() createUserDto: CreateUserDto) {
    console.log({createUserDto})
    return this.appService.getData();
  }
}
