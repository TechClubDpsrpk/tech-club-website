import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { VJudgeClient } from '@/lib/vjudge';
import { VJudgeBrowser } from '@/lib/vjudge-browser';

let leaderboardCache: { data: any; timestamp: number } | null = null;
const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes for active standings

export async function GET() {
    try {
        const now = Date.now();
        if (leaderboardCache && (now - leaderboardCache.timestamp < CACHE_DURATION)) {
            return NextResponse.json(leaderboardCache.data);
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
            return NextResponse.json({ participants: {}, submissions: [], live: false });
        }

        let rankData: any = null;

        // Strategy 1: Direct fast HTTP request via VJudgeClient (typically 200ms)
        try {
            const client = new VJudgeClient(settings.session_cookies || '');
            const data = await client.getRankData(settings.contest_id, settings.contest_password);
            if (data && (data.participants || data.submissions || data.id)) {
                rankData = data;
            }
        } catch (directErr: any) {
            console.warn('Direct VJudge rank fetch failed, attempting browser runner:', directErr.message);
        }

        // Strategy 2: Puppeteer browser fallback if direct HTTP is blocked or failed
        if (!rankData || (!rankData.participants && !rankData.submissions)) {
            try {
                const browserClient = new VJudgeBrowser(settings.session_cookies || '');
                const data = await browserClient.getRankData(settings.contest_id, settings.contest_password);
                if (data && (data.participants || data.submissions || data.id)) {
                    rankData = data;
                }
            } catch (browserErr: any) {
                console.error('VJudge browser runner error:', browserErr.message);
            }
        }

        // Return successful rank data
        if (rankData && (rankData.participants || rankData.submissions)) {
            leaderboardCache = { data: rankData, timestamp: now };
            return NextResponse.json(rankData);
        }

        // If we have stale cached data, serve it as safety net
        if (leaderboardCache) {
            console.warn('Serving stale leaderboard cache due to fetch failures');
            return NextResponse.json(leaderboardCache.data);
        }

        return NextResponse.json(
            { participants: {}, submissions: [], error: 'Could not retrieve standings from VJudge' },
            { status: 200 }
        );
    } catch (error: any) {
        console.error('Leaderboard API Error:', error);
        if (leaderboardCache) {
            return NextResponse.json(leaderboardCache.data);
        }
        return NextResponse.json({ participants: {}, submissions: [], error: error.message }, { status: 500 });
    }
}

