const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Manually parse .env.local
const envPath = path.join(__dirname, '..', '.env.local');
let supabaseUrl = '';
let supabaseServiceKey = '';

try {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const lines = envContent.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const parts = trimmed.split('=');
      const key = parts[0].trim();
      const val = parts.slice(1).join('=').trim().replace(/^['"]|['"]$/g, ''); // strip quotes
      if (key === 'NEXT_PUBLIC_SUPABASE_URL') {
        supabaseUrl = val;
      } else if (key === 'SUPABASE_SERVICE_ROLE_KEY' || key === 'SUPABASE_SERVICE_KEY') {
        supabaseServiceKey = val;
      }
    }
  }
} catch (e) {
  console.error('Error reading .env.local:', e.message);
}

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials in .env.local:', { supabaseUrl: !!supabaseUrl, supabaseServiceKey: !!supabaseServiceKey });
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function inspect() {
  console.log('Checking for tables...');
  
  // Try querying summer_camp_registrations
  const { data: scData, error: scError } = await supabase
    .from('summer_camp_registrations')
    .select('*')
    .limit(1);
    
  if (scError) {
    console.log('summer_camp_registrations check:', scError.code, '-', scError.message);
  } else {
    console.log('summer_camp_registrations exists! Found rows:', scData.length);
  }

  // Let's also check what other tables exist by calling a dummy table or checking users
  const { data: usersData, error: usersError } = await supabase
    .from('users')
    .select('id, email, name')
    .limit(1);
    
  if (usersError) {
    console.log('users check error:', usersError.message);
  } else {
    console.log('users exists! A user row:', usersData);
  }

  process.exit(0);
}

inspect();
