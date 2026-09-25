import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { verifyAuth } from '@/lib/auth';
import { canAssignQuests, hasAccessToAdminPanel } from '@/lib/roles';
import { VJudgeClient } from '@/lib/vjudge';
import { VJudgeBrowser } from '@/lib/vjudge-browser';

const TABLE_NAME = 'tc_sec_cp_leaderboards';

export const SQL_MIGRATION = `-- Run this in your Supabase SQL Editor to create the CP Leaderboards table:
CREATE TABLE IF NOT EXISTS tc_sec_cp_leaderboards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contest_id TEXT NOT NULL,
    contest_title TEXT NOT NULL,
    rankings JSONB NOT NULL DEFAULT '[]'::jsonb,
    status TEXT NOT NULL DEFAULT 'draft',
    saved_by TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security (RLS)
ALTER TABLE tc_sec_cp_leaderboards ENABLE ROW LEVEL SECURITY;

-- Allow service role full access
CREATE POLICY "Service role full access on tc_sec_cp_leaderboards"
    ON tc_sec_cp_leaderboards
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);
`;

/**
 * Auto-matches VJudge participants to club users based on username, display name, and email.
 */
function autoMatchParticipant(
    participant: { username: string; displayName?: string },
    users: Array<{ id: string; name: string; email: string }>
): { id: string; name: string; email: string } | null {
    if (!users || users.length === 0) return null;

    const vName = (participant.displayName || '').trim().toLowerCase();
    const vUser = (participant.username || '').trim().toLowerCase();

    // 1. Exact match on name
    for (const u of users) {
        const uName = (u.name || '').trim().toLowerCase();
        if (vName && uName === vName) return u;
        if (vUser && uName === vUser) return u;
    }

    // 2. Exact match on email prefix (e.g. username@domain.com)
    for (const u of users) {
        const emailPrefix = (u.email || '').split('@')[0].toLowerCase();
        if (vUser && emailPrefix === vUser) return u;
        if (vName && emailPrefix === vName) return u;
    }

    // 3. Name containment (e.g. "naitik" in "naitik chattaraj")
    if (vUser.length >= 4) {
        for (const u of users) {
            const uName = (u.name || '').toLowerCase();
            if (uName.includes(vUser) || vUser.includes(uName)) return u;
        }
    }

    return null;
}

export async function GET(request: NextRequest) {
    try {
        const { authenticated, user } = await verifyAuth(request);
        if (!authenticated || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        if (!canAssignQuests(user.roles) && !hasAccessToAdminPanel(user.roles)) {
            return NextResponse.json({ error: 'Forbidden: Insufficient permissions' }, { status: 403 });
        }

        if (!supabaseAdmin) {
            return NextResponse.json({ error: 'Database admin unavailable' }, { status: 500 });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        const activeContest = searchParams.get('activeContest') === 'true';

        // Always fetch registered club users so admin can map them
        const { data: clubUsers, error: usersErr } = await supabaseAdmin
            .from('tc_sec_u_9b42')
            .select('id, name, email, class, section, avatar_url')
            .order('name', { ascending: true });

        const usersList = clubUsers || [];

        // Mode 1: Fetch a specific saved snapshot by ID
        if (id) {
            const { data, error } = await supabaseAdmin
                .from(TABLE_NAME)
                .select('*')
                .eq('id', id)
                .single();

            if (error) {
                if (error.code === '42P01') {
                    return NextResponse.json({ tableMissing: true, sql: SQL_MIGRATION, error: 'Table missing' }, { status: 404 });
                }
                return NextResponse.json({ error: error.message }, { status: 500 });
            }

            return NextResponse.json({ leaderboard: data, users: usersList });
        }

        // Mode 2: Fetch live contest rankings from VJudge for immediate snapshotting & preview
        if (activeContest) {
            const { data: settings } = await supabaseAdmin
                .from('tc_sec_vj_6a37')
                .select('*')
                .order('updated_at', { ascending: false })
                .limit(1)
                .single();

            if (!settings || !settings.contest_id) {
                return NextResponse.json({ error: 'No active contest configured in settings' }, { status: 400 });
            }

            // Fetch live rank data
            let rankData: any = null;
            try {
                const client = new VJudgeClient(settings.session_cookies || '');
                rankData = await client.getRankData(settings.contest_id, settings.contest_password);
            } catch (err: any) {
                try {
                    const browserClient = new VJudgeBrowser(settings.session_cookies || '');
                    rankData = await browserClient.getRankData(settings.contest_id, settings.contest_password);
                } catch (bErr: any) {
                    return NextResponse.json({ error: 'Could not fetch live standings from VJudge' }, { status: 502 });
                }
            }

            const participants = rankData?.participants || {};
            const submissions = rankData?.submissions || [];

            const processedRankings = Object.entries(participants).map(([uid, participantData]: any) => {
                let username = uid;
                let displayName = '';
                let avatarUrl: string | null = null;

                if (Array.isArray(participantData)) {
                    username = participantData[0] || uid;
                    displayName = participantData[1] || '';
                    avatarUrl = participantData[2] || null;
                } else if (typeof participantData === 'object' && participantData !== null) {
                    username = participantData.username || participantData.name || uid;
                    displayName = participantData.displayName || '';
                    avatarUrl = participantData.avatarUrl || participantData.avatar || null;
                } else if (typeof participantData === 'string') {
                    username = participantData;
                }

                if (avatarUrl) {
                    if (avatarUrl.startsWith('//')) avatarUrl = `https:${avatarUrl}`;
                    else if (avatarUrl.startsWith('/')) avatarUrl = `https://vjudge.net${avatarUrl}`;
                }

                const userSubmissions = submissions.filter((s: any) => String(s[0]) === String(uid));
                const solvedProblems = new Set(
                    userSubmissions.filter((s: any) => Number(s[2]) === 1).map((s: any) => s[1])
                );

                let penaltyMinutes = 0;
                const problemAttempts: { [probId: string]: { solved: boolean; wrongAttempts: number; acTime: number } } = {};
                for (const sub of userSubmissions) {
                    const probId = String(sub[1]);
                    if (!problemAttempts[probId]) {
                        problemAttempts[probId] = { solved: false, wrongAttempts: 0, acTime: 0 };
                    }
                    if (!problemAttempts[probId].solved) {
                        if (Number(sub[2]) === 1) {
                            problemAttempts[probId].solved = true;
                            problemAttempts[probId].acTime = Math.floor(Number(sub[3] || 0) / 60);
                        } else {
                            problemAttempts[probId].wrongAttempts += 1;
                        }
                    }
                }
                for (const p of Object.values(problemAttempts)) {
                    if (p.solved) penaltyMinutes += p.acTime + (p.wrongAttempts * 20);
                }

                // Run auto-match with registered club users
                const matchedUser = autoMatchParticipant({ username, displayName }, usersList);

                return {
                    uid,
                    vjudge_username: username,
                    display_name: displayName || username,
                    avatar_url: avatarUrl,
                    solved: solvedProblems.size,
                    penalty: penaltyMinutes,
                    rank: 0,
                    user_id: matchedUser ? matchedUser.id : null,
                    user_name: matchedUser ? matchedUser.name : null,
                    user_email: matchedUser ? matchedUser.email : null,
                    points_awarded: 0,
                    awarded_at: null,
                };
            }).sort((a, b) => {
                if (b.solved !== a.solved) return b.solved - a.solved;
                return a.penalty - b.penalty;
            }).map((item, index) => ({
                ...item,
                rank: index + 1,
                // Default point recommendation: 1st: 100, 2nd: 75, 3rd: 50, other solvers: 25
                points_awarded: index === 0 ? 100 : index === 1 ? 75 : index === 2 ? 50 : item.solved > 0 ? 25 : 10,
            }));

            return NextResponse.json({
                contest_id: settings.contest_id,
                contest_title: rankData.title || `Contest #${settings.contest_id}`,
                rankings: processedRankings,
                users: usersList,
            });
        }

        // Mode 3: List all saved leaderboards
        const { data: savedList, error: listErr } = await supabaseAdmin
            .from(TABLE_NAME)
            .select('id, contest_id, contest_title, status, saved_by, created_at, updated_at, rankings')
            .order('created_at', { ascending: false });

        if (listErr) {
            if (listErr.code === '42P01') {
                return NextResponse.json({ tableMissing: true, sql: SQL_MIGRATION, leaderboards: [], users: usersList });
            }
            return NextResponse.json({ error: listErr.message }, { status: 500 });
        }

        // Format summary for list view
        const leaderboards = (savedList || []).map((item: any) => {
            const ranks = Array.isArray(item.rankings) ? item.rankings : [];
            const mappedCount = ranks.filter((r: any) => !!r.user_id).length;
            const awardedCount = ranks.filter((r: any) => !!r.awarded_at).length;
            return {
                id: item.id,
                contest_id: item.contest_id,
                contest_title: item.contest_title,
                status: item.status,
                saved_by: item.saved_by,
                created_at: item.created_at,
                updated_at: item.updated_at,
                participant_count: ranks.length,
                mapped_count: mappedCount,
                awarded_count: awardedCount,
            };
        });

        return NextResponse.json({ leaderboards, users: usersList });

    } catch (error: any) {
        console.error('CP Leaderboards API Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const { authenticated, user } = await verifyAuth(request);
        if (!authenticated || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        if (!canAssignQuests(user.roles) && !hasAccessToAdminPanel(user.roles)) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        if (!supabaseAdmin) {
            return NextResponse.json({ error: 'Database admin client unavailable' }, { status: 500 });
        }

        const body = await request.json();
        const { action } = body;

        // Action: Award Points from a saved snapshot
        if (action === 'award') {
            const { snapshotId, rankings } = body;
            if (!snapshotId) {
                return NextResponse.json({ error: 'Missing snapshot ID' }, { status: 400 });
            }

            // Fetch snapshot
            const { data: snapshot, error: snapErr } = await supabaseAdmin
                .from(TABLE_NAME)
                .select('*')
                .eq('id', snapshotId)
                .single();

            if (snapErr || !snapshot) {
                return NextResponse.json({ error: 'Snapshot not found' }, { status: 404 });
            }

            const currentRankings = rankings || snapshot.rankings || [];

            // 1. Find or create a Quest for this contest in tc_sec_qst_7c36
            const questTitle = `CP Contest: ${snapshot.contest_title || `Contest #${snapshot.contest_id}`}`;
            let questId: string | null = null;

            const { data: existingQuest } = await supabaseAdmin
                .from('tc_sec_qst_7c36')
                .select('id, title')
                .eq('title', questTitle)
                .maybeSingle();

            if (existingQuest) {
                questId = existingQuest.id;
            } else {
                const maxPoints = Math.max(...currentRankings.map((r: any) => Number(r.points_awarded) || 0), 100);
                const { data: newQuest, error: createQuestErr } = await supabaseAdmin
                    .from('tc_sec_qst_7c36')
                    .insert({
                        title: questTitle,
                        description: `Points awarded for participation in CP Contest #${snapshot.contest_id}.`,
                        image_url: '/tc-logo_circle.svg',
                        total_points: maxPoints,
                        niche: 'Competitive Programming',
                        created_at: new Date().toISOString(),
                    })
                    .select('id')
                    .single();

                if (!createQuestErr && newQuest) {
                    questId = newQuest.id;
                }
            }

            if (!questId) {
                return NextResponse.json({ error: 'Failed to initialize contest quest entry' }, { status: 500 });
            }

            // 2. Award points in tc_sec_xp_9f21 for every mapped user with points > 0
            let awardedCount = 0;
            const updatedRankings = [];

            for (const item of currentRankings) {
                const points = Number(item.points_awarded) || 0;
                let awardedAt = item.awarded_at;

                if (item.user_id && points > 0) {
                    // Query if record exists
                    const { data: existingXp } = await supabaseAdmin
                        .from('tc_sec_xp_9f21')
                        .select('id')
                        .eq('user_id', item.user_id)
                        .eq('project_id', questId)
                        .maybeSingle();

                    if (existingXp) {
                        await supabaseAdmin
                            .from('tc_sec_xp_9f21')
                            .update({ points })
                            .eq('id', existingXp.id);
                    } else {
                        await supabaseAdmin
                            .from('tc_sec_xp_9f21')
                            .insert({
                                user_id: item.user_id,
                                project_id: questId,
                                points,
                            });
                    }

                    awardedAt = new Date().toISOString();
                    awardedCount++;
                }

                updatedRankings.push({
                    ...item,
                    awarded_at: awardedAt,
                });
            }

            // 3. Update the saved snapshot
            await supabaseAdmin
                .from(TABLE_NAME)
                .update({
                    rankings: updatedRankings,
                    status: 'awarded',
                    updated_at: new Date().toISOString(),
                })
                .eq('id', snapshotId);

            return NextResponse.json({
                success: true,
                awardedCount,
                questTitle,
                message: `Successfully awarded points to ${awardedCount} participants!`,
            });
        }

        // Action: Save / Create a new Contest Leaderboard Snapshot
        const { contest_id, contest_title, rankings } = body;

        if (!contest_id) {
            return NextResponse.json({ error: 'Missing contest ID' }, { status: 400 });
        }

        const insertPayload = {
            contest_id: String(contest_id),
            contest_title: contest_title || `CP Contest #${contest_id}`,
            rankings: Array.isArray(rankings) ? rankings : [],
            status: 'draft',
            saved_by: user.name || user.email || 'Admin',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };

        const { data, error } = await supabaseAdmin
            .from(TABLE_NAME)
            .insert(insertPayload)
            .select()
            .single();

        if (error) {
            if (error.code === '42P01') {
                return NextResponse.json({ tableMissing: true, sql: SQL_MIGRATION, error: 'Table missing' }, { status: 400 });
            }
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, leaderboard: data });

    } catch (error: any) {
        console.error('CP Leaderboards POST Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    try {
        const { authenticated, user } = await verifyAuth(request);
        if (!authenticated || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        if (!canAssignQuests(user.roles) && !hasAccessToAdminPanel(user.roles)) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        if (!supabaseAdmin) {
            return NextResponse.json({ error: 'Database admin unavailable' }, { status: 500 });
        }

        const body = await request.json();
        const { id, rankings, contest_title, status } = body;

        if (!id) {
            return NextResponse.json({ error: 'Missing snapshot ID' }, { status: 400 });
        }

        const updateData: any = {
            updated_at: new Date().toISOString(),
        };

        if (rankings !== undefined) updateData.rankings = rankings;
        if (contest_title !== undefined) updateData.contest_title = contest_title;
        if (status !== undefined) updateData.status = status;

        const { data, error } = await supabaseAdmin
            .from(TABLE_NAME)
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, leaderboard: data });

    } catch (error: any) {
        console.error('CP Leaderboards PUT Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { authenticated, user } = await verifyAuth(request);
        if (!authenticated || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        if (!canAssignQuests(user.roles) && !hasAccessToAdminPanel(user.roles)) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        if (!supabaseAdmin) {
            return NextResponse.json({ error: 'Database admin unavailable' }, { status: 500 });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Missing snapshot ID' }, { status: 400 });
        }

        const { error } = await supabaseAdmin
            .from(TABLE_NAME)
            .delete()
            .eq('id', id);

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error('CP Leaderboards DELETE Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
