import { registerAs } from '@nestjs/config';

export default registerAs('yandexOauth', () => ({
  clientId: process.env.YANDEX_CLIENT_ID,
  clientSecret: process.env.YANDEX_CLIENT_SECRET,
  callbackUrl: process.env.YANDEX_REDIRECT_URI,
}));
