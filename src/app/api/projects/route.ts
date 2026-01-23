import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { verifyAuth } from '@/lib/auth';
import { canAssignQuests } from '@/lib/roles';

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

        const { data, error } = await supabase
            .from('projects')
            .insert({
                title,
                description,
                image_url,
                total_points,
                niche,
                created_by: user.id, // Optional: track creator
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
