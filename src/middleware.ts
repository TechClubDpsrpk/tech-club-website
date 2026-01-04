
import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key'
);

interface JwtPayload {
  siteAccess?: boolean;
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
  const token = request.cookies.get('site_access')?.value;
  const pathname = request.nextUrl.pathname;

  console.log('Site lockdown middleware:', { 
    pathname, 
    hasToken: !!token
  });

  // Routes that are always accessible (lockdown system routes + tc-logo.svg)
  const publicRoutes = ['/coming-soon', '/site-login'];
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));
  
  // Allow tc-logo.svg specifically
  if (pathname === '/tc-logo.svg') {
    console.log('Allowing tc-logo.svg');
    return NextResponse.next();
  }

  // Allow public routes
  if (isPublicRoute) {
    console.log('Public route, allowing access');
    return NextResponse.next();
  }

  // Check for site access token
  if (!token) {
    console.log('No site access token, redirecting to coming soon');
    return NextResponse.redirect(new URL('/coming-soon', request.url));
  }

  try {
    const payload = await verifyJWT(token);
    
    if (!payload || !payload.siteAccess) {
      console.log('Invalid or missing site access, redirecting to coming soon');
      const response = NextResponse.redirect(new URL('/coming-soon', request.url));
      response.cookies.delete('site_access');
      return response;
    }

    console.log('Valid site access token, allowing access');
    return NextResponse.next();
  } catch (error) {
    console.error('Error verifying site access:', error);
    const response = NextResponse.redirect(new URL('/coming-soon', request.url));
    response.cookies.delete('site_access');
    return response;
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};