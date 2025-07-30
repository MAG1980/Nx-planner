import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '@api/auth/auth.service';
import { UserPayload } from '@api/auth/types/user-payload.type';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    //Передаем в конструктор PassportStrategy объект с настройками
    super({
      //Указываем, что мы будем использовать свойство email в качестве логина
      usernameField: 'email',
      /*Если в качестве пароля требуется использовать свойство с названием, отличным от password (дефолтное значение),
       необходимо это указать в свойстве passwordField.*/
      //passwordField: 'passwordName',
    });
  }

  /**
   * LocalStrategy.validate вызывается при каждом срабатывании LocalAuthGuard.
   * В случае успешной проверки соответствия пароля и логина, возвращается объект пользователя,
   * который передается в AuthGuard и добавляется к объекту запроса в виде свойства: request.auth
   * @param email
   * @param password
   */
  async validate(email: string, password: string): Promise<UserPayload> {
    // При регистрации с использованием OAuth пароль по-умолчанию устанавливается равным пустой строке.
    // Чтобы избежать возможности предоставления несанкционированного доступа,
    // проверяем, что введённый при попытке аутентификации пароль не равен пустой строке.
    if (password === '') {
      throw new UnauthorizedException('Password is required');
    }
    return await this.authService.validateLocalUser(email, password);
  }
}
