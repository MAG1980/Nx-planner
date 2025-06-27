import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as argon2 from 'argon2';
import { User } from '@api/users/entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto, UserData } from '@shared-types';
import { hash } from 'argon2';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>
  ) {}

  async create(createUserDto: CreateUserDto): Promise<UserData> {
    const hashedPassword = await hash(createUserDto.password);
    const user = this.usersRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });
    const { password, ...createdUser } = await this.usersRepository.save(user);
    return createdUser;
  }

  async findOne(id: string): Promise<User | null> {
    return this.usersRepository.findOneBy({ id });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { email },
      select: ['id', 'name', 'email', 'password'],
    });
  }

  async findPasswordByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOneOrFail({
      where: { email },
      select: ['password'],
    });
  }

  async updateRefreshToken(id: string, refreshToken: string): Promise<void> {
    const hashedRefreshToken = await argon2.hash(refreshToken);
    await this.usersRepository.update(id, { refreshToken: hashedRefreshToken });
  }

  async removeRefreshToken(id: string): Promise<void> {
    await this.usersRepository.update(id, { refreshToken: null });
  }
}
