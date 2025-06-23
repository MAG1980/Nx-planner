import { IsString, IsEmail, IsNotEmpty } from 'class-validator';
export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  // Использование @IsString() и @IsNotEmpty() избыточно.
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  // @MinLength(6)
  password: string;
}
