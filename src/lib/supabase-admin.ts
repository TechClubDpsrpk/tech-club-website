import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
// Try both common variable names
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL');
}

// Create a client with the Service Role Key for privileged operations
// This bypasses RLS policies, so use carefully!
export const supabaseAdmin = supabaseServiceKey
    ? createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    })
    : null;

export async function createAdminSession(userId: string, ip: string, userAgent: string) {
    if (!supabaseAdmin) {
        throw new Error('Server misconfiguration: Missing SUPABASE_SERVICE_ROLE_KEY');
    }

    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour expiration

    const { data, error } = await supabaseAdmin
        .from('admin_sessions')
        .insert([
            {
                user_id: userId,
                ip_address: ip,
                user_agent: userAgent,
                expires_at: expiresAt,
            },
        ])
        .select()
        .single();

    if (error) {
        console.error('Error creating admin session:', error);
        throw error;
    }
    return data;
}

export async function verifyAdminSession(sessionId: string): Promise<boolean> {
    if (!supabaseAdmin) {
        console.warn('verifyAdminSession: Missing Service Key, cannot verify session securely');
        return false;
    }

    const { data, error } = await supabaseAdmin
        .from('admin_sessions')
        .select('expires_at')
        .eq('id', sessionId)
        .single();

    if (error || !data) return false;

    if (new Date(data.expires_at) < new Date()) {
        // Session expired
        return false;
    }

    return true;
}

// ========== SITE ACCESS SESSION MANAGEMENT ==========

export async function createSiteSession(ip: string, userAgent: string, city: string = 'Unknown', country: string = 'Unknown') {
    if (!supabaseAdmin) {
        throw new Error('Server misconfiguration: Missing SUPABASE_SERVICE_ROLE_KEY');
    }

    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days expiration

    const { data, error } = await supabaseAdmin
        .from('site_access_sessions')
        .insert([
            {
                ip_address: ip,
                user_agent: userAgent,
                city,
                country,
                expires_at: expiresAt,
            },
        ])
        .select()
        .single();

    if (error) {
        console.error('Error creating site session:', error);
        throw error;
    }
    return data;
}

export async function verifySiteSession(sessionId: string): Promise<boolean> {
    if (!supabaseAdmin) {
        console.warn('verifySiteSession: Missing Service Key');
        return false;
    }

    const { data, error } = await supabaseAdmin
        .from('site_access_sessions')
        .select('expires_at')
        .eq('id', sessionId)
        .single();

    if (error || !data) return false;

    if (new Date(data.expires_at) < new Date()) {
        return false;
    }

    return true;
}
