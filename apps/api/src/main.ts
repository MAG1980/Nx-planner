/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '@api/app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);
  // Глобальная настройка ValidationPipe.
  // Также возможно внедрение индивидуального ValidationPipe в каждый модуль (кастомный провайдер)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Удаляет поля, не описанные в DTO
      forbidNonWhitelisted: true, // Бросает ошибку, если есть лишние поля
      transform: true, // Преобразует данные в соответствии с типами DTO
      disableErrorMessages: false, // Отключает сообщения об ошибках (false - показывать)
      transformOptions: {
        enableImplicitConversion: true, // Включает неявное преобразование типов
      },
    })
  );
  const port = process.env.PORT || 5000;
  await app.listen(port);
  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`
  );
}

bootstrap();
