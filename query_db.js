const { createClient } = require('@supabase/supabase-client');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function check() {
    const { data, error } = await supabase
        .from('vjudge_settings')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();

    if (error) {
        console.error('Error:', error.message);
        return;
    }

    console.log('Contest ID:', data.contest_id);
    console.log('Cookies Length:', data.session_cookies ? data.session_cookies.length : 0);
    // console.log('Cookies:', data.session_cookies);
}

check();
