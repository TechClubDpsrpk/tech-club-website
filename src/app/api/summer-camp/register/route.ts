import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { createSummerCampRegistration, getSummerCampRegistration } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if already registered
    const existing = await getSummerCampRegistration(user.id);
    if (existing) {
      return NextResponse.json(
        { error: 'You are already registered for the summer camp' },
        { status: 409 }
      );
    }

    const body = await request.json();
    const { interestedNiche, motivation } = body;

    if (!interestedNiche || !interestedNiche.trim()) {
      return NextResponse.json(
        { error: 'Please select an interested niche/track' },
        { status: 400 }
      );
    }

    if (!motivation || !motivation.trim()) {
      return NextResponse.json(
        { error: 'Please enter your motivation for joining' },
        { status: 400 }
      );
    }

    // Register using user's existing profile info prefilled
    const registration = await createSummerCampRegistration({
      userId: user.id,
      name: user.name,
      email: user.email,
      phoneNumber: user.phone_number,
      class: user.class,
      section: user.section,
      admissionNumber: user.admission_number,
      interestedNiche,
      motivation,
    });

    return NextResponse.json({
      message: 'Successfully registered for the Tech Club Summer Camp 2026!',
      registration,
    }, { status: 201 });
  } catch (error) {
    console.error('Summer camp registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
