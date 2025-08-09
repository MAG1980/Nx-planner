import {
  ConflictException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { User } from '@api/users/entities/user.entity';
import { UsersService } from '@api/users/users.service';
import { CreateUserDto, JwtPayload, Tokens, UserData } from '@shared-types';
import { verify } from 'argon2';
import { UserPayload } from '@api/auth/types/user-payload.type';
import refreshJwtConfig from '@api/auth/configs/refresh-jwt.config';
import { ConfigType } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    //Внедрение экземпляра объекта конфигурации с помощью токена refreshConfig.KEY(namespace="refresh-jwt")
    @Inject(refreshJwtConfig.KEY)
    private readonly refreshTokenJwtConfig: ConfigType<typeof refreshJwtConfig>
  ) {}

  async signup(createUserDto: CreateUserDto): Promise<UserData> {
    const user = await this.usersService.findByEmail(createUserDto.email);

    if (user) {
      throw new ConflictException('User already exists');
    }

    //Создание нового пользователя
    //В случае успешной регистрации возвращаем данные пользователя
    //Ни в коем случае не возвращаем пароль после успешной регистрации
    //Т.к. данные пользователя в итоге будут добавлены к request
    return await this.usersService.create(createUserDto);
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.usersService.findByEmail(email);
    if (!user) return null;

    const passwordMatches = await argon2.verify(user.password, password);
    if (!passwordMatches) return null;

    return user;
  }

  async login(user: UserPayload): Promise<Tokens> {
    console.log({ loginUser: user });
    const tokens = await this.getTokens(user);
    await this.usersService.updateRefreshToken(user.sub, tokens.refreshToken);
    return tokens;
  }

  async logout(userId: string): Promise<void> {
    await this.usersService.removeRefreshToken(userId);
  }

  async refreshTokens(userId: string, refreshToken: string): Promise<Tokens> {
    const user = await this.usersService.findOne(userId);
    if (!user || !user.refreshToken) {
      throw new UnauthorizedException('Missing refresh token');
    }

    const refreshTokenMatches = await argon2.verify(
      user.refreshToken,
      refreshToken
    );
    if (!refreshTokenMatches) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    const { id, email, name } = user;
    const tokens = await this.getTokens({ sub: id, email, name });
    await this.usersService.updateRefreshToken(user.id, tokens.refreshToken);
    return tokens;
  }

  private async getTokens({ sub, email, name }: UserPayload): Promise<Tokens> {
    const jwtPayload: JwtPayload = {
      sub,
      email,
      name,
    };

    const [accessToken, refreshToken] = await Promise.all([
      //В AuthModule был зарегистрирован JwtModule с jwtConfig в качестве провайдера,
      //содержащий signOptions.expiresIn, поэтому повторная передача свойств secret и expiresIn не требуется,
      this.jwtService.signAsync(
        jwtPayload
        //{secret: process.env.JWT_SECRET, expiresIn: '15m'}
      ),
      //Options переданы с помощью внедрённого в конструкторе объекта конфигурации.
      this.jwtService.signAsync(jwtPayload, this.refreshTokenJwtConfig),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  async validateLocalUser(
    email: string,
    password: string
  ): Promise<UserPayload> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      //В целях повышения безопасности в тексте ошибки нежелательно сообщать о причине, по которой аутентификация провалилась.
      //Лучше избегать уточнений типа "User not found", чтобы не давать злоумышленникам информацию о существующих пользователях.
      throw new UnauthorizedException('Invalid credentials');
    }

    console.log({ password, userPassword: user.password });

    // await обязателен, т. к. в противном случае всегда isPasswordMatched == Promise == true.
    const isPasswordMatched = await verify(user.password, password);
    if (!isPasswordMatched) {
      throw new UnauthorizedException('Invalid credentials');
    }

    //В случае успешной аутентификации возвращаем данные пользователя.
    //Ни в коем случае не возвращаем пароль после успешной аутентификации.
    //Т.к. данные пользователя в итоге будут добавлены к request.
    return { sub: user.id, name: user.name, email: user.email };
  }

  async validateOauthUser(googleUser: CreateUserDto): Promise<UserData> {
    //Проверка на существование пользователя в БД
    const user = await this.usersService.findByEmail(googleUser.email);
    if (user) {
      console.log({ user });
      return user;
    }
    //Создаём и возвращаем нового пользователя, если он не был найден в БД
    return this.usersService.create(googleUser);
  }
}
