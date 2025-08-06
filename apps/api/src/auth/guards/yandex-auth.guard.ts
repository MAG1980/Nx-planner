import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
//Благодаря тому, что в конструктор AuthGuard передано значение 'yandex'
//GoogleAuthGuard будет автоматически связан со стратегией (Strategy), импортируемой из пакета 'passport-yandex'
//т.е. YandexStrategy
export class YandexAuthGuard extends AuthGuard('yandex') {}
