import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

const protectedRoutes = ['/account'];
const adminRoutes = ['/admin'];

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('auth')?.value;
  const pathname = request.nextUrl.pathname;

  // Check if route is admin route (but not login page)
  const isAdminRoute =
    adminRoutes.some((route) => pathname.startsWith(route)) &&
    pathname !== '/admin/login';

  if (isAdminRoute) {
    // Always redirect to admin login, everyone goes there first
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  // Check if route is protected route
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (isProtectedRoute) {
    if (!token) {
      return NextResponse.redirect(new URL('/signup', request.url));
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.redirect(new URL('/signup', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/account/:path*', '/admin/:path*'],
};