import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
//Благодаря тому, что в конструктор AuthGuard передано значение 'google'
//GoogleAuthGuard будет автоматически связан со стратегией (Strategy), импортируемой из пакета 'passport-google-oauth20'
//т.е. GoogleStrategy
export class GoogleAuthGuard extends AuthGuard('google') {}
