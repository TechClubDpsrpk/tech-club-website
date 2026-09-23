import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { verifyAuth } from '@/lib/auth';
import { canAssignQuests } from '@/lib/roles';

export async function GET(request: NextRequest) {
    try {
        const { authenticated, user } = await verifyAuth(request);

        if (!authenticated || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        if (!supabaseAdmin) {
            return NextResponse.json({ error: 'Database admin unavailable' }, { status: 500 });
        }

        const projectId = request.nextUrl.searchParams.get('projectId');
        const userOnly = request.nextUrl.searchParams.get('userOnly');

        // If checking own submission for a specific project
        if (projectId && userOnly === 'true') {
            const { data, error } = await supabaseAdmin
                .from('tc_sec_qsub_0d48')
                .select('id, status, points_awarded, created_at')
                .eq('user_id', user.id)
                .eq('project_id', projectId)
                .maybeSingle();

            if (error) {
                console.error('Error fetching user submission:', error);
                return NextResponse.json({ error: error.message }, { status: 500 });
            }

            return NextResponse.json({ submission: data });
        }

        // Otherwise, admin/moderator list
        if (!canAssignQuests(user.roles)) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { data, error } = await supabaseAdmin
            .from('tc_sec_qsub_0d48')
            .select(`
                id, user_id, project_id, github_link, drive_link, status, points_awarded, created_at,
                user:tc_sec_u_9b42!user_id (name, email),
                project:tc_sec_qst_7c36!project_id (title, total_points)
            `)
            .order('created_at', { ascending: false });

        if (error) {
            // Fallback if foreign key naming is default
            const { data: rawSubs, error: rawError } = await supabaseAdmin
                .from('tc_sec_qsub_0d48')
                .select('*')
                .order('created_at', { ascending: false });

            if (rawError) throw rawError;

            // Fetch users and projects separately
            const userIds = [...new Set(rawSubs.map(s => s.user_id))];
            const projectIds = [...new Set(rawSubs.map(s => s.project_id))];

            const { data: usersData } = await supabaseAdmin
                .from('tc_sec_u_9b42')
                .select('id, name, email')
                .in('id', userIds);

            const { data: projectsData } = await supabaseAdmin
                .from('tc_sec_qst_7c36')
                .select('id, title, total_points')
                .in('id', projectIds);

            const userMap = new Map((usersData || []).map(u => [u.id, u]));
            const projectMap = new Map((projectsData || []).map(p => [p.id, p]));

            const formatted = rawSubs.map(s => ({
                ...s,
                user: userMap.get(s.user_id) || { name: 'Unknown', email: '' },
                project: projectMap.get(s.project_id) || { title: 'Unknown Project', total_points: 0 }
            }));

            return NextResponse.json({ submissions: formatted });
        }

        const formatted = data.map((sub: any) => ({
            id: sub.id,
            user_id: sub.user_id,
            project_id: sub.project_id,
            github_link: sub.github_link,
            drive_link: sub.drive_link,
            status: sub.status,
            points_awarded: sub.points_awarded,
            created_at: sub.created_at,
            user: Array.isArray(sub.user) ? sub.user[0] : sub.user,
            project: Array.isArray(sub.project) ? sub.project[0] : sub.project,
        }));

        return NextResponse.json({ submissions: formatted });

    } catch (error) {
        console.error('Submissions API error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const { authenticated, user } = await verifyAuth(request);

        if (!authenticated || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        if (!supabaseAdmin) {
            return NextResponse.json({ error: 'Database admin unavailable' }, { status: 500 });
        }

        const { projectId, githubLink, driveLink } = await request.json();

        if (!projectId) {
            return NextResponse.json({ error: 'Missing projectId' }, { status: 400 });
        }

        if (!githubLink && !driveLink) {
            return NextResponse.json({ error: 'Please provide either a GitHub link or Google Drive link' }, { status: 400 });
        }

        const { data, error } = await supabaseAdmin
            .from('tc_sec_qsub_0d48')
            .insert({
                user_id: user.id,
                project_id: projectId,
                github_link: githubLink || null,
                drive_link: driveLink || null,
                status: 'pending',
                created_at: new Date().toISOString(),
            })
            .select()
            .single();

        if (error) {
            if (error.code === '23505' || error.message.includes('duplicate')) {
                return NextResponse.json({ error: 'You have already submitted for this project' }, { status: 409 });
            }
            console.error('Error inserting submission:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, submission: data });

    } catch (error) {
        console.error('Submission POST error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
