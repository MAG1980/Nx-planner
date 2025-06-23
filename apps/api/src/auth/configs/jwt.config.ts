import { registerAs } from '@nestjs/config';
import { JwtModuleOptions } from '@nestjs/jwt';

//Возвращает объект конфигурации с указанным пространством имён (токеном)
export default registerAs(
  //Токен пространства имён будет можно использовать в configService
  // для доступа к свойствам объекта конфигурации с помощью dot-notation
  'jwt',
  (): JwtModuleOptions => ({
    secret: process.env.JWT_SECRET,
    signOptions: {
      expiresIn: process.env.JWT_EXPIRES_IN,
    },
  })
);
