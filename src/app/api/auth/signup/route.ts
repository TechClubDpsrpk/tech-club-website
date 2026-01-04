import { NextRequest, NextResponse } from 'next/server';
import { createUser, findUserByEmail, createVerificationToken } from '@/lib/db';
import { hashPassword } from '@/lib/password';
import { createToken } from '@/lib/auth';
import { sendWelcomeEmail, sendVerificationEmail } from '@/lib/email';
import { supabase } from '@/lib/supabaseClient';
import { UAParser } from 'ua-parser-js';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Helper function to extract IP address
function getClientIP(request: NextRequest): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  
  return (
    request.headers.get('x-real-ip') ||
    request.headers.get('cf-connecting-ip') ||
    'unknown'
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      email,
      name,
      password,
      confirmPassword,
      phoneNumber,
      class: userClass,
      section,
      admissionNumber,
      githubId,
      discordId,
      whyJoinTechClub,
      skillsAndAchievements,
      eventParticipation,
      projects,
      interestedNiches,
    } = body;

    // Check all required fields
    if (
      !email ||
      !name ||
      !password ||
      !confirmPassword ||
      !phoneNumber ||
      !userClass ||
      !section ||
      !admissionNumber ||
      !whyJoinTechClub ||
      !eventParticipation
    ) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!EMAIL_REGEX.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: 'Passwords do not match' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    if (!Array.isArray(interestedNiches) || interestedNiches.length === 0) {
      return NextResponse.json(
        { error: 'Select at least one niche' },
        { status: 400 }
      );
    }

    const existingUser = await findUserByEmail(email.toLowerCase());
    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
      );
    }

    const hashedPassword = await hashPassword(password);
    const user = await createUser({
      email: email.toLowerCase(),
      name,
      passwordHash: hashedPassword,
      phoneNumber,
      class: userClass,
      section,
      admissionNumber,
      githubId: githubId || null,
      discordId: discordId || null,
      whyJoinTechClub,
      skillsAndAchievements: skillsAndAchievements || null,
      eventParticipation,
      projects: projects || null,
      interestedNiches,
    });

    console.log('✅ User created:', user.id, user.email);

    // 🔥 SEND WELCOME EMAIL (optional, don't block signup)
    try {
      await sendWelcomeEmail(user.email, user.name);
      console.log('✅ Welcome email sent to:', user.email);
    } catch (err) {
      console.error('❌ Failed to send welcome email to', user.email, ':', err);
    }

    // 🔥 CREATE VERIFICATION TOKEN AND SEND VERIFICATION EMAIL
    try {
      const verificationToken = await createVerificationToken(user.id);
      console.log('✅ Verification token created:', verificationToken);

      await sendVerificationEmail(user.email, user.name, verificationToken);
      console.log('✅ Verification email sent to:', user.email);
    } catch (err) {
      console.error('❌ Verification token/email error for', user.email, ':', err);
    }

    const token = await createToken(user);

    // ========== SESSION TRACKING ==========
    
    // Parse user agent for device/browser/OS info
    const userAgent = request.headers.get('user-agent') || '';
    const parser = new UAParser(userAgent);
    const device = parser.getResult();

    // Extract IP address
    const ip = getClientIP(request);

    // Get geolocation from IP (optional)
    let city = 'Unknown';
    let country = 'Unknown';
    
    if (ip !== 'unknown' && !ip.startsWith('192.168.') && !ip.startsWith('10.') && !ip.startsWith('172.') && ip !== '127.0.0.1') {
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

    // Format device info - Better approach
    const deviceType = device.device.type || 'desktop'; // If no type, assume desktop

    let deviceInfo: string;
    if (deviceType === 'mobile' || deviceType === 'tablet') {
      // For mobile/tablet, try to get vendor and model
      const vendor = device.device.vendor || '';
      const model = device.device.model || '';
      deviceInfo = [vendor, model].filter(Boolean).join(' ') || `${deviceType.charAt(0).toUpperCase() + deviceType.slice(1)} Device`;
    } else {
      // For desktop, use OS as the device identifier
      const osName = device.os.name || 'Unknown OS';
      deviceInfo = `${osName} Computer`;
    }

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
      const now = new Date();
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
        last_active_at: now.toISOString(),
        expires_at: expiresAt.toISOString(),
      });

      console.log('✅ Session created for new user:', user.email);

    } catch (sessionError) {
      // Log but don't fail signup if session tracking fails
      console.error('Failed to create session record:', sessionError);
    }

    // ========== END SESSION TRACKING ==========

    const response = NextResponse.json(
      {
        message: 'Account created successfully',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          phoneNumber: user.phone_number,
          class: user.class,
          section: user.section,
          admissionNumber: user.admission_number,
          githubId: user.github_id,
          discordId: user.discord_id,
          whyJoinTechClub: user.why_join_tech_club,
          skillsAndAchievements: user.skills_and_achievements,
          eventParticipation: user.event_participation,
          projects: user.projects,
          interestedNiches: user.interested_niches,
          emailVerified: user.email_verified,
        },
      },
      { status: 201 }
    );

    response.cookies.set('auth', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error('❌ Signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}