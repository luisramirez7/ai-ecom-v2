import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import * as jose from 'jose';

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined");
}

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

// Add paths that require authentication
const protectedPaths = [
  '/api/protected',
  '/api/orders',
  '/orders',
];

// Add paths that should redirect to login if user is authenticated
const authPaths = ['/login', '/register'];

// Add paths that should be excluded from middleware
const publicPaths = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/logout',
  '/_next',
  '/favicon.ico',
  '/public'
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  console.log('Middleware processing:', pathname);

  // Skip middleware for public paths
  if (publicPaths.some(path => pathname.startsWith(path))) {
    console.log('Public path, skipping middleware:', pathname);
    return NextResponse.next();
  }

  // Check if the path requires authentication
  const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path));
  const isAuthPath = authPaths.some(path => pathname.startsWith(path));

  // Get token from cookie
  const token = request.cookies.get('token')?.value;
  console.log('Token found:', !!token);

  // Handle protected paths
  if (isProtectedPath || pathname.startsWith('/api/auth/me')) {
    if (!token) {
      console.log('No token found for protected path:', pathname);
      // If it's an API route, return 401
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
      }
      // Otherwise redirect to login
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }

    try {
      // Verify token
      console.log('Verifying token...');
      const { payload } = await jose.jwtVerify(token, JWT_SECRET);
      console.log('Token verified for user:', payload.email);

      // For API routes, add user info to headers
      if (pathname.startsWith('/api/')) {
        const requestHeaders = new Headers(request.headers);
        requestHeaders.set('x-user-id', payload.userId as string);
        requestHeaders.set('x-user-email', payload.email as string);
        return NextResponse.next({
          headers: requestHeaders,
        });
      }

      return NextResponse.next();
    } catch (error) {
      console.log('Token verification failed:', error);
      // Token is invalid or expired
      const response = pathname.startsWith('/api/')
        ? NextResponse.json({ error: "Invalid token" }, { status: 401 })
        : NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('token');
      return response;
    }
  }

  // Handle auth paths (login/register)
  if (isAuthPath && token) {
    try {
      // If user is already authenticated, redirect to home
      await jose.jwtVerify(token, JWT_SECRET);
      console.log('Authenticated user accessing auth path, redirecting to home');
      return NextResponse.redirect(new URL('/', request.url));
    } catch (error) {
      console.log('Token verification failed for auth path:', error);
      // Token is invalid, allow access to auth pages
      const response = NextResponse.next();
      response.cookies.delete('token');
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}; 