import { NextRequest, NextResponse } from 'next/server';
import { findUserByEmail } from '@/lib/db';
import { verifyPassword } from '@/lib/password';
import { createToken } from '@/lib/auth';
import { supabase } from '@/lib/supabaseClient';
import { UAParser } from 'ua-parser-js';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Missing email or password' },
        { status: 400 }
      );
    }

    const user = await findUserByEmail(email);
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const isPasswordValid = await verifyPassword(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const token = await createToken(user);

    // ========== SESSION TRACKING ==========
    
    // Parse user agent for device/browser/OS info
    const userAgent = request.headers.get('user-agent') || '';
    const parser = new UAParser(userAgent);
    const device = parser.getResult();

    // Extract IP address
    const ip = 
      request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      request.headers.get('x-real-ip') ||
      request.headers.get('cf-connecting-ip') || // Cloudflare
      'unknown';

    // Get geolocation from IP (optional)
    let city = 'Unknown';
    let country = 'Unknown';
    
    if (ip !== 'unknown' && !ip.startsWith('192.168.') && ip !== '127.0.0.1') {
      try {
        const geoResponse = await fetch(`https://ipapi.co/${ip}/json/`, {
          headers: { 'User-Agent': 'tech-club-website' },
          signal: AbortSignal.timeout(2000), // 2 second timeout
        });
        
        if (geoResponse.ok) {
          const geoData = await geoResponse.json();
          city = geoData.city || 'Unknown';
          country = geoData.country_name || 'Unknown';
        }
      } catch (error) {
        // Silently fail - geolocation is nice-to-have
        console.warn('Geolocation lookup failed:', error);
      }
    }

    // Format device info
    const deviceInfo = [
      device.device.vendor,
      device.device.model,
      device.device.type
    ]
      .filter(Boolean)
      .join(' ') || 'Unknown Device';

    const browserInfo = [
      device.browser.name,
      device.browser.version
    ]
      .filter(Boolean)
      .join(' ') || 'Unknown Browser';

    const osInfo = [
      device.os.name,
      device.os.version
    ]
      .filter(Boolean)
      .join(' ') || 'Unknown OS';

    // Create session record
    try {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

      await supabase.from('sessions').insert({
        user_id: user.id,
        session_token: token,
        device_info: deviceInfo,
        browser: browserInfo,
        os: osInfo,
        ip_address: ip,
        city,
        country,
        expires_at: expiresAt.toISOString(),
      });

      // Clean up old expired sessions for this user
      await supabase
        .from('sessions')
        .delete()
        .eq('user_id', user.id)
        .lt('expires_at', new Date().toISOString());

    } catch (sessionError) {
      // Log but don't fail login if session tracking fails
      console.error('Failed to create session record:', sessionError);
    }

    // ========== END SESSION TRACKING ==========

    const response = NextResponse.json(
      {
        message: 'Login successful',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          emailVerified: user.email_verified,
          avatarUrl: user.avatar_url,
        },
      },
      { status: 200 }
    );

    response.cookies.set('auth', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}