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

// Helper function to get user IP
function getUserIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  if (realIp) {
    return realIp;
  }
  return 'unknown';
}

// Check if IP is banned
async function checkIPBan(ip: string): Promise<{ banned: boolean; reason?: string }> {
  if (ip === 'unknown') return { banned: false };

  const { data, error } = await supabase
    .from('banned_ips')
    .select('reason, ban_expires_at')
    .eq('ip_address', ip)
    .maybeSingle();

  if (error || !data) return { banned: false };

  // Check if ban has expired
  if (data.ban_expires_at) {
    const expiryDate = new Date(data.ban_expires_at);
    if (expiryDate < new Date()) {
      // Ban expired, remove it
      await supabase.from('banned_ips').delete().eq('ip_address', ip);
      return { banned: false };
    }
  }

  return { banned: true, reason: data.reason };
}

// Check if user is banned
async function checkUserBan(userId: string): Promise<{ banned: boolean; reason?: string }> {
  const { data, error } = await supabase
    .from('users')
    .select('is_banned, ban_reason, ban_expires_at')
    .eq('id', userId)
    .single();

  if (error || !data) return { banned: false };

  // Check if ban has expired
  if (data.is_banned && data.ban_expires_at) {
    const expiryDate = new Date(data.ban_expires_at);
    if (expiryDate < new Date()) {
      // Ban expired, unban user
      await supabase
        .from('users')
        .update({ 
          is_banned: false, 
          ban_reason: null, 
          ban_expires_at: null 
        })
        .eq('id', userId);
      return { banned: false };
    }
  }

  return { 
    banned: data.is_banned || false, 
    reason: data.ban_reason 
  };
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
  const userIP = getUserIP(request);

  console.log('Middleware checking:', { 
    pathname, 
    hasToken: !!token,
    userIP
  });

  // FIRST: Check IP ban for ALL routes (except admin login)
  if (pathname !== '/admin/login' && pathname !== '/banned') {
    const ipBanCheck = await checkIPBan(userIP);
    if (ipBanCheck.banned) {
      console.log('IP is banned:', userIP);
      return NextResponse.redirect(
        new URL(`/banned?reason=${encodeURIComponent(ipBanCheck.reason || 'IP banned')}`, request.url)
      );
    }
  }

  // If user has token, check user ban
  if (token && pathname !== '/banned') {
    const payload = await verifyJWT(token);
    if (payload) {
      const userBanCheck = await checkUserBan(payload.id);
      if (userBanCheck.banned) {
        console.log('User is banned:', payload.id);
        const response = NextResponse.redirect(
          new URL(`/banned?reason=${encodeURIComponent(userBanCheck.reason || 'Account banned')}`, request.url)
        );
        response.cookies.delete('auth');
        return response;
      }

      // Update user's last IP
      await supabase
        .from('users')
        .update({ last_ip: userIP })
        .eq('id', payload.id);
    }
  }

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

      const { data: userData, error } = await supabase
        .from('users')
        .select('email_verified')
        .eq('id', payload.id)
        .single();

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
  matcher: ['/account/:path*', '/admin/:path*', '/quests/:path*', '/announcements/:path*', '/banned'],
};