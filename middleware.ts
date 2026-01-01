import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { supabase } from '@/lib/supabaseClient';

const protectedRoutes = ['/account'];
const adminRoutes = ['/admin'];
const verifiedOnlyRoutes = ['/quests']; // Routes that require email verification
const authOnlyRoutes = ['/announcements']; // Routes that require authentication only

// Define the shape of your JWT payload
interface JwtPayload {
  userId: string;
  [key: string]: any;
}

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

  // Check if route requires email verification
  const isVerifiedOnlyRoute = verifiedOnlyRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (isVerifiedOnlyRoute) {
    if (!token) {
      return NextResponse.redirect(new URL('/signup', request.url));
    }

    const payload = await verifyToken(token) as JwtPayload | null;
    if (!payload) {
      return NextResponse.redirect(new URL('/signup', request.url));
    }

    // Check email verification status from Supabase
    try {
      const { data: userData, error } = await supabase
        .from('users')
        .select('email_verified')
        .eq('id', payload.userId)
        .single();

      if (error || !userData?.email_verified) {
        // Redirect to account page or a verification prompt page
        return NextResponse.redirect(new URL('/account?verify=true', request.url));
      }
    } catch (error) {
      console.error('Error checking email verification:', error);
      return NextResponse.redirect(new URL('/account', request.url));
    }
  }

  // Check if route requires authentication only (no verification needed)
  const isAuthOnlyRoute = authOnlyRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (isAuthOnlyRoute) {
    if (!token) {
      return NextResponse.redirect(new URL('/signup', request.url));
    }

    const payload = await verifyToken(token) as JwtPayload | null;
    if (!payload) {
      return NextResponse.redirect(new URL('/signup', request.url));
    }
    // No email verification check - just authentication required
  }

  // Check if route is protected route
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (isProtectedRoute) {
    if (!token) {
      return NextResponse.redirect(new URL('/signup', request.url));
    }

    const payload = await verifyToken(token) as JwtPayload | null;
    if (!payload) {
      return NextResponse.redirect(new URL('/signup', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/account/:path*', '/admin/:path*', '/quests/:path*', '/announcements/:path*'],
};