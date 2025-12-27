import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, uploadAvatar } from '@/lib/auth';
import { updateUserAvatar } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('avatar') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'File must be an image' },
        { status: 400 }
      );
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File must be less than 5MB' },
        { status: 400 }
      );
    }

    const avatarUrl = await uploadAvatar(user.id, file);
    await updateUserAvatar(user.id, avatarUrl);

    return NextResponse.json({ avatarUrl });
  } catch (error) {
    console.error('Upload avatar error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}