import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { verifyAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
    try {
        const { authenticated, user } = await verifyAuth(request);

        if (!authenticated || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        if (!supabaseAdmin) {
            return NextResponse.json({ error: 'Database admin unavailable' }, { status: 500 });
        }

        // Fetch user activities
        const { data: activities, error } = await supabaseAdmin
            .from('tc_sec_xp_9f21')
            .select('id, project_id, points')
            .eq('user_id', user.id);

        if (error) throw error;

        // Fetch project titles
        const projectIds = [...new Set((activities || []).map(a => a.project_id))];
        let projectsMap = new Map();

        if (projectIds.length > 0) {
            const { data: projects } = await supabaseAdmin
                .from('tc_sec_qst_7c36')
                .select('id, title, total_points')
                .in('id', projectIds);

            if (projects) {
                projectsMap = new Map(projects.map(p => [p.id, p]));
            }
        }

        const formatted = (activities || []).map(a => ({
            id: a.id,
            project_id: a.project_id,
            points: a.points,
            project: projectsMap.get(a.project_id) || { title: 'Unknown Quest', total_points: a.points }
        }));

        return NextResponse.json({ activities: formatted });

    } catch (error) {
        console.error('Activity API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
