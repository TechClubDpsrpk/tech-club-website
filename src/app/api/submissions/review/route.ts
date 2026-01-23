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

        const { submissionId, status, points, projectId, userId } = await request.json();

        if (!submissionId || !status) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        if (status === 'approved') {
            if (points === undefined || points <= 0) {
                return NextResponse.json({ error: 'Invalid points for approval' }, { status: 400 });
            }

            // Update submission
            const { error: updateError } = await supabase
                .from('project_submissions')
                .update({ status: 'approved', points_awarded: points })
                .eq('id', submissionId);

            if (updateError) {
                throw updateError;
            }

            // Update project activity
            const { error: activityError } = await supabase
                .from('project_activity')
                .upsert({
                    user_id: userId,
                    project_id: projectId,
                    points: points,
                });

            if (activityError) {
                // Should we rollback submission update? Ideally yes, but Supabase HTTP client doesn't support transactions easily without RPC.
                // Logging error for now.
                console.error('Failed to update project activity', activityError);
            }
        } else if (status === 'rejected') {
            const { error } = await supabase
                .from('project_submissions')
                .update({ status: 'rejected' })
                .eq('id', submissionId);

            if (error) throw error;
        } else {
            return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Submission review error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
