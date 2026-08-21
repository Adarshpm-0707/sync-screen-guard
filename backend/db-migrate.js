import fs from 'fs';
import path from 'path';
import pg from 'pg';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPassword = process.env.DB_PASSWORD;

if (!dbPassword || dbPassword.includes('your_db_password')) {
  console.error('\n❌ ERROR: DB_PASSWORD is not set or is still placeholder in .env.');
  console.log('Please add your Supabase database password to .env:');
  console.log('DB_PASSWORD=your_actual_database_password\n');
  process.exit(1);
}

// Extract project reference from SUPABASE_URL
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

async function migrate() {
  try {
    console.log(`Connecting to Supabase database for project ${projectRef}...`);
    await client.connect();
    console.log('Connected successfully!');

    // Read schema.sql
    const schemaPath = path.join(__dirname, '../supabase/schema.sql');
    console.log(`Reading schema from ${schemaPath}...`);
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');

    // Run schema
    console.log('Applying database schema tables and policies...');
    await client.query(schemaSql);
    console.log('✅ Schema applied successfully!');

    // Read seed.sql if it exists
    const seedPath = path.join(__dirname, '../supabase/seed.sql');
    if (fs.existsSync(seedPath)) {
      console.log(`Reading seed data from ${seedPath}...`);
      const seedSql = fs.readFileSync(seedPath, 'utf8');
      console.log('Applying seed data...');
      await client.query(seedSql);
      console.log('✅ Seed data applied successfully!');
    }

  } catch (err) {
    console.error('❌ Migration failed:', err.message);
  } finally {
    await client.end();
  }
}

migrate();
