import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const dbPassword = process.env.DB_PASSWORD;
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const match = supabaseUrl.match(/https:\/\/(.*)\.supabase\.co/);
const projectRef = match ? match[1] : '';

const dbHost = process.env.SUPABASE_DB_HOST || 'aws-0-ap-south-1.pooler.supabase.com';
const dbUser = process.env.SUPABASE_DB_USER || (projectRef ? `postgres.${projectRef}` : 'postgres');
const dbPort = process.env.SUPABASE_DB_PORT || '5432';

const connectionString = process.env.DATABASE_URL || 
  `postgresql://${dbUser}:${encodeURIComponent(dbPassword)}@${dbHost}:${dbPort}/postgres`;

const client = new pg.Client({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  try {
    await client.connect();
    console.log('Connected to database to add column...');
    await client.query(`
      ALTER TABLE public.products 
      ADD COLUMN IF NOT EXISTS theme_color TEXT DEFAULT 'blue';
    `);
    console.log('✅ Column theme_color added successfully to products table!');
  } catch (err) {
    console.error('❌ Failed to add column:', err.message);
  } finally {
    await client.end();
  }
}

run();
