import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { jwtVerify } from 'jose';

const protectedRoutes = ['/account'];
const adminRoutes = ['/admin'];
const verifiedOnlyRoutes = ['/quests'];
const authOnlyRoutes = ['/announcements'];

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key'
);

interface JwtPayload {
  id: string;
  email: string;
  [key: string]: any;
}

async function verifyJWT(token: string): Promise<JwtPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as JwtPayload;
  } catch (error) {
    console.error('JWT verification failed:', error);
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('auth')?.value;
  const pathname = request.nextUrl.pathname;

  console.log('Middleware checking:', { 
    pathname, 
    hasToken: !!token,
    tokenPreview: token ? token.substring(0, 20) + '...' : 'none'
  });

  // Check if route is admin route (but not login page)
  const isAdminRoute =
    adminRoutes.some((route) => pathname.startsWith(route)) &&
    pathname !== '/admin/login';

  if (isAdminRoute) {
    if (!token) {
      console.log('No token, redirecting to admin login');
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    try {
      const payload = await verifyJWT(token);
      
      if (!payload) {
        console.log('Invalid token, redirecting to admin login');
        return NextResponse.redirect(new URL('/admin/login', request.url));
      }

      console.log('Admin token verification result:', { 
        success: true, 
        userId: payload.id
      });

      // Check if user is actually an admin using is_admin column
      const { data: userData, error } = await supabase
        .from('users')
        .select('is_admin')
        .eq('id', payload.id)
        .single();

      console.log('Admin check:', { 
        userId: payload.id,
        isAdmin: userData?.is_admin, 
        error: error?.message 
      });

      if (error || !userData?.is_admin) {
        console.log('Not an admin, redirecting');
        return NextResponse.redirect(new URL('/admin/login', request.url));
      }

      console.log('Admin authenticated, allowing access');
      return NextResponse.next();
    } catch (error) {
      console.error('Error in admin route check:', error);
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  // Check if route requires email verification
  const isVerifiedOnlyRoute = verifiedOnlyRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (isVerifiedOnlyRoute) {
    console.log('Checking verified-only route');
    
    if (!token) {
      console.log('No token, redirecting to signup');
      return NextResponse.redirect(new URL('/signup', request.url));
    }

    try {
      const payload = await verifyJWT(token);
      
      if (!payload) {
        console.log('Invalid token, redirecting to signup');
        const response = NextResponse.redirect(new URL('/signup', request.url));
        response.cookies.delete('auth');
        return response;
      }

      console.log('Quest token verification result:', { 
        success: true, 
        userId: payload.id
      });

      console.log('Token verified, checking email verification for user:', payload.id);

      const { data: userData, error } = await supabase
        .from('users')
        .select('email_verified')
        .eq('id', payload.id)
        .single();

      console.log('Email verification check:', { 
        userId: payload.id,
        emailVerified: userData?.email_verified,
        error: error?.message
      });

      if (error) {
        console.error('Supabase error:', error);
        return NextResponse.redirect(new URL('/account?verify=true', request.url));
      }

      if (!userData?.email_verified) {
        console.log('Email not verified, redirecting to account');
        return NextResponse.redirect(new URL('/account?verify=true', request.url));
      }

      console.log('Email verified, allowing access to quest route');
      return NextResponse.next();
    } catch (error) {
      console.error('Error checking email verification:', error);
      const response = NextResponse.redirect(new URL('/signup', request.url));
      response.cookies.delete('auth');
      return response;
    }
  }

  // Check if route requires authentication only
  const isAuthOnlyRoute = authOnlyRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (isAuthOnlyRoute) {
    console.log('Checking auth-only route');
    
    if (!token) {
      console.log('No token, redirecting to signup');
      return NextResponse.redirect(new URL('/signup', request.url));
    }

    try {
      const payload = await verifyJWT(token);
      
      if (!payload) {
        console.log('Invalid token, redirecting to signup');
        const response = NextResponse.redirect(new URL('/signup', request.url));
        response.cookies.delete('auth');
        return response;
      }

      console.log('Auth token verification result:', { 
        success: true, 
        userId: payload.id
      });

      console.log('Auth check passed for announcements');
      return NextResponse.next();
    } catch (error) {
      console.error('Error in auth-only route check:', error);
      const response = NextResponse.redirect(new URL('/signup', request.url));
      response.cookies.delete('auth');
      return response;
    }
  }

  // Check if route is protected route
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (isProtectedRoute) {
    console.log('Checking protected route');
    
    if (!token) {
      console.log('No token, redirecting to signup');
      return NextResponse.redirect(new URL('/signup', request.url));
    }

    try {
      const payload = await verifyJWT(token);
      
      if (!payload) {
        console.log('Invalid token, redirecting to signup');
        const response = NextResponse.redirect(new URL('/signup', request.url));
        response.cookies.delete('auth');
        return response;
      }

      console.log('Protected route token verification result:', { 
        success: true, 
        userId: payload.id
      });

      console.log('Protected route access granted');
      return NextResponse.next();
    } catch (error) {
      console.error('Error in protected route check:', error);
      const response = NextResponse.redirect(new URL('/signup', request.url));
      response.cookies.delete('auth');
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/account/:path*', '/admin/:path*', '/quests/:path*', '/announcements/:path*'],
};