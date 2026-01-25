import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { VJudgeClient } from '@/lib/vjudge';

let leaderboardCache: { data: any; timestamp: number } | null = null;
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

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

        const client = new VJudgeClient(settings.session_cookies);
        const rankData = await client.getRankData(settings.contest_id, settings.contest_password);

        leaderboardCache = { data: rankData, timestamp: now };

        return NextResponse.json(rankData);
    } catch (error: any) {
        console.error('Leaderboard API Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
