import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// import {jwtDecode, JwtPayload} from "jwt-decode";

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  const { pathname } = request.nextUrl;

  const protectedRoutes = ['/dashboard', '/profile'];
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  /*
    // Логируем все заголовки для отладки
    console.log('✅ Middleware triggered for:', pathname)
    const headers = Object.fromEntries(request.headers.entries());
    console.log('Request headers:', headers);
  */

  if (pathname === '/profile') {
    const response = NextResponse.rewrite(new URL('/', request.url));
    return response;
  }

  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  // Извлекаем refreshToken из cookie
  const refreshToken = request.cookies.get('refresh_token')?.value;

  /*
    // В данном случае в этом нет смысла, т.к. accessToken хранится в контексте React и обновить его из middleware невозможно.
    // Извлекаем access_token из заголовка Authorization
    const authHeader = request.headers.get('authorization') || '';
    const accessToken = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
    console.log('Extracted access token:', accessToken);

    // Это может пригодиться при хранении accessToken в cookie.
    // Проверяем актуальность accessToken
    if (accessToken) {
      const {exp} = jwtDecode<JwtPayload>(accessToken);

      if (exp && Date.now() < exp * 1000) {
        // Если срок действия токена не истёк - пропускаем запрос
        return NextResponse.next();
      } else {
        return NextResponse.redirect(new URL('/api/auth/refresh', request.url));
      }
    }
    */

  // Если пользователь не аутентифицирован и пытается получить доступ к защищенным маршрутам, перенаправляем его на страницу аутентификации.
  if (!refreshToken && isProtectedRoute) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Если пользователь аутентифицирован и пытается получить доступ к auth-маршрутам.
  if (refreshToken && pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return response;
}

export const config = {
  matcher: ['/login', '/dashboard/:path*', '/profile/:path*', '/api/:path*'],
};
