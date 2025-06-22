import { ConfigService } from '@nestjs/config';
import { DataSourceOptions } from 'typeorm';

export const getTypeOrmConfig = (
  configService: ConfigService
): DataSourceOptions => ({
  type: 'postgres',
  host: configService.get<string>('DB_HOST'),
  port: configService.get<number>('DB_PORT'),
  username: configService.get<string>('DB_USER'),
  password: configService.get<string>('DB_PASSWORD'),
  database: configService.get<string>('DB_NAME'),
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/../migrations/*{.ts,.js}'],
  synchronize: configService.get<boolean>('DB_SYNCHRONIZE', false),
  logging: configService.get<string>('NODE_ENV') === 'development',
  migrationsTableName: 'typeorm_migrations',
});
