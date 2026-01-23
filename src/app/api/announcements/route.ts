import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { verifyAuth } from '@/lib/auth';
import { canCreateAnnouncements } from '@/lib/roles';

export async function POST(request: NextRequest) {
    try {
        const { authenticated, user } = await verifyAuth(request);

        if (!authenticated || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        if (!canCreateAnnouncements(user.roles)) {
            return NextResponse.json({ error: 'Forbidden: Insufficient permissions' }, { status: 403 });
        }

        const { heading, description, image_url } = await request.json();

        if (!heading || !description) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const { data, error } = await supabase
            .from('announcements')
            .insert({
                heading,
                description,
                image_url,
                author_id: user.id, // Optional: track who created it
                created_at: new Date().toISOString(),
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating announcement:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, announcement: data });
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Internal User Error' }, { status: 500 });
    }
}
