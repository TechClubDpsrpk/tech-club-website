import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { verifyAuth } from '@/lib/auth';
import { canAssignQuests } from '@/lib/roles';

export async function GET(request: NextRequest) {
    try {
        if (!supabaseAdmin) {
            return NextResponse.json({ error: 'Database admin client unavailable' }, { status: 500 });
        }

        const id = request.nextUrl.searchParams.get('id');

        if (id) {
            const { data, error } = await supabaseAdmin
                .from('tc_sec_qst_7c36')
                .select('*')
                .eq('id', id)
                .single();

            if (error || !data) {
                return NextResponse.json({ error: 'Project not found' }, { status: 404 });
            }

            return NextResponse.json({ project: data });
        }

        const { data, error } = await supabaseAdmin
            .from('tc_sec_qst_7c36')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching projects:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ projects: data || [] });
    } catch (error) {
        console.error('API GET Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const { authenticated, user } = await verifyAuth(request);

        if (!authenticated || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        if (!canAssignQuests(user.roles)) {
            return NextResponse.json({ error: 'Forbidden: Insufficient permissions' }, { status: 403 });
        }

        const { title, description, image_url, total_points, niche } = await request.json();

        if (!title || !description || !total_points || !niche) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        if (!supabaseAdmin) {
            return NextResponse.json({ error: 'Database admin client unavailable' }, { status: 500 });
        }

        const { data, error } = await supabaseAdmin
            .from('tc_sec_qst_7c36')
            .insert({
                title,
                description,
                image_url,
                total_points,
                niche,
                created_at: new Date().toISOString(),
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating project:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, project: data });
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { authenticated, user } = await verifyAuth(request);

        if (!authenticated || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        if (!canAssignQuests(user.roles)) {
            return NextResponse.json({ error: 'Forbidden: Insufficient permissions' }, { status: 403 });
        }

        const id = request.nextUrl.searchParams.get('id');
        if (!id) {
            return NextResponse.json({ error: 'Missing project id' }, { status: 400 });
        }

        if (!supabaseAdmin) {
            return NextResponse.json({ error: 'Database admin client unavailable' }, { status: 500 });
        }

        const { error } = await supabaseAdmin
            .from('tc_sec_qst_7c36')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting project:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('API Delete Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
