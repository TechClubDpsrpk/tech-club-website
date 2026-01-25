import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = supabaseUrl && supabaseServiceKey
    ? createClient(supabaseUrl, supabaseServiceKey)
    : null;

export async function GET(req: NextRequest) {
    try {
        if (!supabaseAdmin) {
            return NextResponse.json({ error: 'Supabase admin not configured' }, { status: 500 });
        }

        const { data, error } = await supabaseAdmin
            .from('vjudge_settings')
            .select('*')
            .limit(1)
            .single();

        if (error && error.code !== 'PGRST116') {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        if (!data) {
            return NextResponse.json({
                organiser_username: '',
                organiser_password: '',
                contest_id: '',
                contest_password: '',
                session_cookies: '',
                problem_count: 10,
                problem_titles: ''
            });
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('VJudge settings GET error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { organiser_username, organiser_password, contest_id, contest_password, session_cookies, problem_count, problem_titles } = body;

        if (!contest_id) {
            return NextResponse.json({ error: 'Missing contest ID' }, { status: 400 });
        }

        if (!supabaseAdmin) {
            return NextResponse.json({ error: 'Supabase admin not configured' }, { status: 500 });
        }

        // Check if we already have a record
        const { data: existing } = await supabaseAdmin
            .from('vjudge_settings')
            .select('id')
            .limit(1)
            .single();

        let result;
        const updateData: any = {
            organiser_username,
            contest_id,
            contest_password,
            session_cookies,
            problem_count: parseInt(problem_count) || 10,
            problem_titles: problem_titles || null,
            updated_at: new Date().toISOString(),
        };

        if (organiser_password && organiser_password !== '********') {
            updateData.organiser_password = organiser_password;
        }

        if (existing) {
            result = await supabaseAdmin
                .from('vjudge_settings')
                .update(updateData)
                .eq('id', existing.id);
        } else {
            result = await supabaseAdmin
                .from('vjudge_settings')
                .insert([updateData]);
        }

        if (result.error) {
            return NextResponse.json({ error: result.error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('VJudge settings POST error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        if (!supabaseAdmin) {
            return NextResponse.json({ error: 'Supabase admin not configured' }, { status: 500 });
        }

        // Delete all records from vjudge_settings
        const { error } = await supabaseAdmin
            .from('vjudge_settings')
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all rows

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('VJudge settings DELETE error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
