import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { getTypeOrmConfig } from '../config/typeorm.config';

// Для использования вне NestJS (например, в CLI миграций)
const configService = new ConfigService();
const config = getTypeOrmConfig(configService);

export default new DataSource(config);
