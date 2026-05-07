import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const PUBLIC_PATHS = new Set(['/login']);

const parseJwtExp = (token: string | undefined): number | null => {
  if (!token) return null;
  try {
    const payloadPart = token.split('.')[1];
    if (!payloadPart) return null;
    const normalized = payloadPart.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
    const decoded = JSON.parse(Buffer.from(padded, 'base64').toString('utf8'));
    return typeof decoded.exp === 'number' ? decoded.exp : null;
  } catch {
    return null;
  }
};

const isExpired = (token: string | undefined): boolean => {
  const exp = parseJwtExp(token);
  if (!exp) return false;
  return Date.now() >= exp * 1000;
};

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isPublic = PUBLIC_PATHS.has(path);

  const token = request.cookies.get('auth_token')?.value;
  const hasToken = Boolean(token);
  const expired = isExpired(token);

  if (!isPublic && (!hasToken || expired)) {
    const loginUrl = new URL('/login', request.url);
    if (expired) {
      loginUrl.searchParams.set('reason', 'session_expired');
    }

    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete('auth_token');
    return response;
  }

  if (isPublic && hasToken && !expired) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard',
    '/members',
    '/contributions',
    '/seasons',
    '/settings',
    '/login',
  ],
};
