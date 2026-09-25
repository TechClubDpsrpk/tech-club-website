import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { VJudgeClient } from '@/lib/vjudge';
import { VJudgeBrowser } from '@/lib/vjudge-browser';

let contestCache: { data: any; timestamp: number } | null = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

function generateFallbackProblems(count?: number, titlesString?: string) {
    const total = count || 10;
    const titles = titlesString ? titlesString.split(',').map((t: string) => t.trim()) : [];
    const problems = [];
    for (let i = 0; i < total; i++) {
        const letter = String.fromCharCode(65 + i);
        problems.push({ num: letter, title: titles[i] || letter, pid: i + 1 });
    }
    return problems;
}

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
            .from('tc_sec_vj_6a37')
            .select('*')
            .order('updated_at', { ascending: false })
            .limit(1)
            .single();

        if (settingsError || !settings || !settings.contest_id) {
            return NextResponse.json({ live: false });
        }

        let contestData: any = null;
        let pageTitle: string | null = null;

        // Strategy 1: Direct fast HTTP request via VJudgeClient
        try {
            const client = new VJudgeClient(settings.session_cookies || '');
            const directData = await client.getContestData(
                settings.contest_id,
                settings.contest_password,
                settings.problem_count || 10,
                settings.problem_titles
            );
            if (directData && (directData.title || directData.problems)) {
                contestData = directData;
            }
        } catch (directErr: any) {
            console.warn('Direct VJudge contest fetch failed, attempting browser runner:', directErr.message);
        }

        // Strategy 2: Browser runner fallback
        if (!contestData) {
            try {
                const browserClient = new VJudgeBrowser(settings.session_cookies || '');
                const browserResult = await browserClient.getContestData(
                    settings.contest_id,
                    settings.contest_password
                );
                contestData = browserResult.contestData;
                pageTitle = browserResult.pageTitle;
            } catch (browserErr: any) {
                console.warn('Browser VJudge contest fetch failed:', browserErr.message);
            }
        }

        // Determine title
        let displayTitle = contestData?.title || `CP Contest #${settings.contest_id}`;
        if (pageTitle && pageTitle.includes(' - Virtual Judge')) {
            const matches = pageTitle.match(/\[(.*?)\]/);
            if (matches && matches[1]) {
                displayTitle = matches[1];
            } else {
                displayTitle = pageTitle.replace(' - Virtual Judge', '').trim();
            }
        }

        // Determine problems
        let problems: any[] = [];
        if (contestData?.problems && Array.isArray(contestData.problems) && contestData.problems.length > 0) {
            problems = contestData.problems;
        } else {
            problems = generateFallbackProblems(settings.problem_count, settings.problem_titles);
        }

        const result = {
            live: true,
            title: displayTitle,
            problems: problems,
            id: settings.contest_id,
            password: settings.contest_password
        };

        contestCache = { data: result, timestamp: now };
        return NextResponse.json(result);
    } catch (error: any) {
        console.error('Contest API Error:', error);

        if (contestCache) {
            return NextResponse.json(contestCache.data);
        }

        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

