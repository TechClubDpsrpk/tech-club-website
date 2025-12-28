import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { updateUserProfile } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      phoneNumber,
      class: userClass,
      section,
      githubId,
      interestedNiches,
    } = body;

    // Validate required fields
    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: 'Name cannot be empty' },
        { status: 400 }
      );
    }

    if (!phoneNumber || !phoneNumber.trim()) {
      return NextResponse.json(
        { error: 'Phone number cannot be empty' },
        { status: 400 }
      );
    }

    if (!userClass || !userClass.trim()) {
      return NextResponse.json(
        { error: 'Class cannot be empty' },
        { status: 400 }
      );
    }

    if (!section || !section.trim()) {
      return NextResponse.json(
        { error: 'Section cannot be empty' },
        { status: 400 }
      );
    }

    if (!Array.isArray(interestedNiches) || interestedNiches.length === 0) {
      return NextResponse.json(
        { error: 'Please select at least one niche' },
        { status: 400 }
      );
    }

    // Update user profile with all fields
    await updateUserProfile(user.id, {
      name,
      phoneNumber,
      class: userClass,
      section,
      githubId: githubId || null,
      interestedNiches,
    });

    return NextResponse.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}