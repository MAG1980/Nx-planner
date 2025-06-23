import { PickType } from '@nestjs/swagger';
import { CreateUserDto } from '@shared-types';

export class LoginUserDto extends PickType(CreateUserDto, [
  'email',
  'password',
] as const) {}
