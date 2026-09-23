import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { verifyAuth } from '@/lib/auth';
import { canCreateAnnouncements } from '@/lib/roles';

export async function GET() {
    try {
        if (!supabaseAdmin) {
            return NextResponse.json({ error: 'Database admin client unavailable' }, { status: 500 });
        }

        const { data, error } = await supabaseAdmin
            .from('tc_sec_bltn_5b92')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching announcements:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ announcements: data || [] });
    } catch (error) {
        console.error('API GET Error:', error);
        return NextResponse.json({ error: 'Internal User Error' }, { status: 500 });
    }
}

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

        if (!supabaseAdmin) {
            return NextResponse.json({ error: 'Database admin client unavailable' }, { status: 500 });
        }

        const { data, error } = await supabaseAdmin
            .from('tc_sec_bltn_5b92')
            .insert({
                heading,
                description,
                image_url,
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

export async function DELETE(request: NextRequest) {
    try {
        const { authenticated, user } = await verifyAuth(request);

        if (!authenticated || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        if (!canCreateAnnouncements(user.roles)) {
            return NextResponse.json({ error: 'Forbidden: Insufficient permissions' }, { status: 403 });
        }

        const id = request.nextUrl.searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Missing announcement id' }, { status: 400 });
        }

        if (!supabaseAdmin) {
            return NextResponse.json({ error: 'Database admin client unavailable' }, { status: 500 });
        }

        const { error } = await supabaseAdmin
            .from('tc_sec_bltn_5b92')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting announcement:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('API Delete Error:', error);
        return NextResponse.json({ error: 'Internal User Error' }, { status: 500 });
    }
}
