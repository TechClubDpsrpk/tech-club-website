import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET() {
    try {
        if (!supabaseAdmin) {
            return NextResponse.json({ error: 'Database admin client unavailable' }, { status: 500 });
        }

        // Fetch users
        const { data: users, error: userError } = await supabaseAdmin
            .from('tc_sec_u_9b42')
            .select('id, name, email, class, section, avatar_url, interested_niches');

        if (userError) throw userError;

        // Fetch activities
        const { data: activities, error: activityError } = await supabaseAdmin
            .from('tc_sec_xp_9f21')
            .select('user_id, project_id, points');

        if (activityError) throw activityError;

        // Fetch projects to map niche
        const { data: projects, error: projectError } = await supabaseAdmin
            .from('tc_sec_qst_7c36')
            .select('id, niche');

        if (projectError) throw projectError;

        const projectNicheMap = new Map((projects || []).map((p: any) => [p.id, p.niche]));

        // Group activity by user
        const userActivityMap = new Map<string, Array<{ project_id: string; points: number }>>();
        (activities || []).forEach((act: any) => {
            const list = userActivityMap.get(act.user_id) || [];
            list.push({ project_id: act.project_id, points: act.points });
            userActivityMap.set(act.user_id, list);
        });

        const entries = (users || []).map((u: any) => ({
            id: u.id,
            name: u.name,
            email: u.email,
            class: u.class,
            section: u.section,
            avatarUrl: u.avatar_url,
            interested_niches: u.interested_niches || [],
            project_activity: userActivityMap.get(u.id) || [],
        }));

        const projectNiches = (projects || []).map((p: any) => ({ id: p.id, niche: p.niche }));

        return NextResponse.json({ users: entries, projects: projectNiches });

    } catch (error) {
        console.error('Leaderboard API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
