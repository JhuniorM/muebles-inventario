
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testLogin() {
    const email = 'prueba@muebles.com';
    const password = 'prueba';

    console.log(`Attempting to login with: ${email}`);

    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        console.error('Login failed:', error.message);
        console.error('Full error:', error);
    } else {
        console.log('Login successful!');
        console.log('User ID:', data.user.id);
        console.log('Session:', data.session ? 'Active' : 'No session');
    }
}

testLogin();
