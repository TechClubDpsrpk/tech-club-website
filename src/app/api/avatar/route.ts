import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url');

  if (!url) {
    return new NextResponse('Missing URL', { status: 400 });
  }

  try {
    let normalizedUrl = url.trim();
    if (normalizedUrl.startsWith('//')) {
      normalizedUrl = 'https:' + normalizedUrl;
    } else if (normalizedUrl.startsWith('/')) {
      normalizedUrl = 'https://vjudge.net' + normalizedUrl;
    }

    // Extract the path after /public/avatars/
    // Example: https://xxxx.supabase.co/storage/v1/object/public/avatars/user-id/avatar.png
    const match = normalizedUrl.match(/\/public\/avatars\/(.+)$/);
    if (!match) {
      // If it's not a supabase avatar url (e.g. Google/Github/VJudge default avatar), redirect to it
      try {
        new URL(normalizedUrl);
        return NextResponse.redirect(normalizedUrl);
      } catch {
        return new NextResponse('Invalid URL', { status: 400 });
      }
    }

    const filePath = match[1];

    if (!supabaseAdmin) {
      return new NextResponse('Internal Error', { status: 500 });
    }

    // Download using service role key to bypass RLS
    const { data, error } = await supabaseAdmin.storage
      .from('avatars')
      .download(filePath);

    if (error || !data) {
      console.error('Error downloading avatar:', error);
      return new NextResponse('Not found', { status: 404 });
    }

    // Return the image data
    return new NextResponse(data, {
      headers: {
        'Content-Type': data.type || 'image/jpeg',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('Avatar proxy error:', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
