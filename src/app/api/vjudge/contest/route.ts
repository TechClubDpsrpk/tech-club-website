import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { VJudgeBrowser } from '@/lib/vjudge-browser';
// import { VJudgeClient } from '@/lib/vjudge';

let contestCache: { data: any; timestamp: number } | null = null;
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

export async function GET() {
    try {
        const now = Date.now();
        if (contestCache && (now - contestCache.timestamp < CACHE_DURATION)) {
            return NextResponse.json(contestCache.data);
        }

        if (!supabaseAdmin) {
            return NextResponse.json({ error: 'Supabase admin not configured' }, { status: 500 });
        }

        const { data: settings, error: settingsError } = await supabaseAdmin
            .from('vjudge_settings')
            .select('*')
            .order('updated_at', { ascending: false })
            .limit(1)
            .single();

        if (settingsError || !settings) {
            return NextResponse.json({ error: 'VJudge settings not configured' }, { status: 400 });
        }

        if (!settings.session_cookies) {
            return NextResponse.json({ error: 'VJudge session cookies not provided' }, { status: 400 });
        }

        const client = new VJudgeBrowser(settings.session_cookies);
        // Note: browser client contest data fetching inside, we parse title/problems
        const contestData = await client.getContestData(
            settings.contest_id,
            settings.contest_password
        );

        // Reconstruct problems array if not present (vjudge-browser logic pending full replacement)
        // If contestData came effectively from ajaxData, it should have the structure.
        // If we need formatting, we do it here.

        let problems: any[] = [];
        if (contestData.problems) {
            problems = contestData.problems;
        } else if (settings.problem_titles || settings.problem_count) {
            const count = settings.problem_count || 10;
            const titles = settings.problem_titles ? settings.problem_titles.split(',').map((t: string) => t.trim()) : [];
            for (let i = 0; i < count; i++) {
                const letter = String.fromCharCode(65 + i);
                problems.push({ num: letter, title: titles[i] || letter });
            }
        }

        const result = {
            title: contestData.title,
            problems: problems,
            id: settings.contest_id,
            password: settings.contest_password
        };

        contestCache = { data: result, timestamp: now };

        return NextResponse.json(result);
    } catch (error: any) {
        console.error('Contest API Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
