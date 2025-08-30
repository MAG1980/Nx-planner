import { registerAs } from '@nestjs/config';

export default registerAs('appleOauth', () => ({
  clientID: process.env.APPLE_CLIENT_ID,
  teamID: process.env.APPLE_TEAM_ID,
  keyID: process.env.APPLE_KEY_ID,
  callbackURL: process.env.APPLE_CALLBACK_URL,
}));
