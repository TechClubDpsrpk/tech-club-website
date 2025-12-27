import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getUserById } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('avatar') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'File must be an image' }, { status: 400 });
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File must be less than 5MB' }, { status: 400 });
    }

    // Convert to base64 for storage
    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString('base64');
    const dataUrl = `data:${file.type};base64,${base64}`;

    // Update user in database
    const dbUser = await getUserById(user.id);
    if (dbUser) {
      dbUser.avatarUrl = dataUrl;
    }

    return NextResponse.json(
      {
        message: 'Avatar updated',
        avatarUrl: dataUrl,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Upload avatar error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
