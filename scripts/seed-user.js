
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing environment variables: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createAdminUser() {
    const email = 'prueba@muebles.com';
    const password = 'prueba';

    console.log(`Attempting to create user: ${email}`);

    // Check if user already exists (optional, but good practice to avoid errors if run multiple times)
    const { data: listUsers, error: listError } = await supabase.auth.admin.listUsers();

    if (listError) {
        console.error('Error listing users:', listError);
        return;
    }

    const existingUser = listUsers.users.find(u => u.email === email);
    if (existingUser) {
        console.log('User already exists. Attempting to update password...');
        const { error: updateError } = await supabase.auth.admin.updateUserById(
            existingUser.id,
            { password: password, email_confirm: true }
        );
        if (updateError) {
            console.error('Error updating user:', updateError);
        } else {
            console.log('User password updated successfully.');
        }
        return;
    }

    const { data, error } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true // Confirm email automatically
    });

    if (error) {
        console.error('Error creating user:', error);
    } else {
        console.log('User created successfully:', data.user.email);
    }
}

createAdminUser();
