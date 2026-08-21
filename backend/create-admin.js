import { supabaseAdmin } from './supabase.js';

const email = process.argv[2] || 'admin@syncarmor.in';
const password = process.argv[3] || 'admin123';

async function createAdmin() {
  console.log(`Creating admin user: ${email}...`);
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { is_admin: true }
  });

  if (error) {
    console.error('❌ Error creating admin:', error.message);
  } else {
    console.log('✅ Admin user created successfully in Supabase Auth!');
    console.log('Email:', data.user.email);
  }
}

createAdmin();
