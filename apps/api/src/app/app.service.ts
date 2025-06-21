import {Injectable} from '@nestjs/common';
import {CreateUserDto} from "@shared-types";

@Injectable()
export class AppService {
  getData(user: CreateUserDto): { message: string } {
    return {message: `Hello ${user.name}!`};
  }
}
