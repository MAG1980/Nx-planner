import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

//SetMetadata — это встроенный декоратор NestJS, который добавляет метаданные к классу или методу
export const SkipAuth = () => SetMetadata(IS_PUBLIC_KEY, true);
