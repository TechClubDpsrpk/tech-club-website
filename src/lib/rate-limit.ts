import { supabaseAdmin } from './supabase-admin';

export async function isIPBanned(ip: string): Promise<boolean> {
    if (!supabaseAdmin) return false;

    const { data, error } = await supabaseAdmin
        .from('banned_ips')
        .select('id, ban_expires_at')
        .eq('ip_address', ip)
        .maybeSingle();

    if (error || !data) return false;


    if (data.ban_expires_at) {
        const expiresAt = new Date(data.ban_expires_at);
        if (expiresAt < new Date()) {

            await supabaseAdmin.from('banned_ips').delete().eq('id', data.id);
            return false;
        }
    }

    return true;
}

export async function checkRateLimit(ip: string, route: string): Promise<{
    allowed: boolean;
    remaining: number;
    resetAt: Date;
}> {
    if (!supabaseAdmin) return { allowed: true, remaining: 10, resetAt: new Date() };

    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();

    const { count, error } = await supabaseAdmin
        .from('login_attempts')
        .select('*', { count: 'exact', head: true })
        .eq('ip_address', ip)
        .eq('route', route)
        .eq('success', false)
        .gt('created_at', fifteenMinutesAgo);

    const attempts = count || 0;
    const maxAttempts = 10;

    return {
        allowed: attempts < maxAttempts,
        remaining: Math.max(0, maxAttempts - attempts),
        resetAt: new Date(Date.now() + 15 * 60 * 1000) // Rough approximation
    };
}


export async function logLoginAttempt(
    ip: string,
    route: string,
    passwordAttempted: string,
    success: boolean,
    userAgent: string
) {
    if (!supabaseAdmin) return;

    await supabaseAdmin.from('login_attempts').insert({
        ip_address: ip,
        route,
        password_attempted: passwordAttempted,
        success,
        user_agent: userAgent
    });
}


export async function evaluateBan(ip: string) {
    if (!supabaseAdmin) return;

    const { count, error } = await supabaseAdmin
        .from('login_attempts')
        .select('*', { count: 'exact', head: true })
        .eq('ip_address', ip)
        .eq('success', false);

    if (count && count >= 30) {
        const alreadyBanned = await isIPBanned(ip);
        if (!alreadyBanned) {
            await supabaseAdmin.from('banned_ips').insert({
                ip_address: ip,
                reason: 'Automated ban: Exceeded 30 failed login attempts',
                banned_by: 'system'
            });
        }
    }
}
