/**
 * Auto-migration script for Sync Screen Guard.
 * Connects directly to Supabase Postgres via pg driver.
 * Run: node backend/auto-migrate.cjs
 */
const { Client } = require('pg');
const dotenv = require('dotenv');
dotenv.config();

// Extract project reference from SUPABASE_URL
const supabaseUrl = process.env.SUPABASE_URL || '';
const projectRef = supabaseUrl.replace('https://', '').split('.')[0];
const dbPassword = process.env.DB_PASSWORD;

if (!projectRef || !dbPassword) {
  console.error('❌ Missing SUPABASE_URL or DB_PASSWORD in .env');
  process.exit(1);
}

const connectionString = `postgresql://postgres:${dbPassword}@db.${projectRef}.supabase.co:5432/postgres`;

const MIGRATIONS = [
  {
    name: 'Create shipments table (full schema)',
    sql: `
      CREATE TABLE IF NOT EXISTS public.shipments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        order_id TEXT NOT NULL,
        shiprocket_order_id TEXT,
        awb TEXT,
        status TEXT NOT NULL DEFAULT 'pending',
        tracking_url TEXT,
        courier_name TEXT,
        eta TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL
      );
    `
  },
  {
    name: 'Grant SELECT on shipments to anon and authenticated',
    sql: `GRANT SELECT, INSERT, UPDATE ON public.shipments TO anon, authenticated;`
  },
  {
    name: 'Add courier_name to shipments',
    sql: `ALTER TABLE public.shipments ADD COLUMN IF NOT EXISTS courier_name TEXT;`
  },
  {
    name: 'Add eta to shipments',
    sql: `ALTER TABLE public.shipments ADD COLUMN IF NOT EXISTS eta TIMESTAMPTZ;`
  },
  {
    name: 'Add shiprocket_order_id to shipments',
    sql: `ALTER TABLE public.shipments ADD COLUMN IF NOT EXISTS shiprocket_order_id TEXT;`
  },
  {
    name: 'Add awb to shipments',
    sql: `ALTER TABLE public.shipments ADD COLUMN IF NOT EXISTS awb TEXT;`
  },
  {
    name: 'Add tracking_url to shipments',
    sql: `ALTER TABLE public.shipments ADD COLUMN IF NOT EXISTS tracking_url TEXT;`
  },
  {
    name: 'Add is_guest to orders',
    sql: `ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS is_guest BOOLEAN DEFAULT false;`
  },
  {
    name: 'Add cod_fee to orders',
    sql: `ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS cod_fee NUMERIC DEFAULT 0;`
  },
  {
    name: 'Add customer_email to orders',
    sql: `ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS customer_email TEXT;`
  },
  {
    name: 'Add customer_name to orders',
    sql: `ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS customer_name TEXT;`
  },
  {
    name: 'Add payment_type to orders',
    sql: `ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_type TEXT DEFAULT 'cod';`
  },
  {
    name: 'Add payment_status to orders',
    sql: `ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending';`
  },
  {
    name: 'Add phone to orders',
    sql: `ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS phone TEXT;`
  },
  {
    name: 'Add address to orders',
    sql: `ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS address TEXT;`
  },
  {
    name: 'Add city to orders',
    sql: `ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS city TEXT;`
  },
  {
    name: 'Add state to orders',
    sql: `ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS state TEXT;`
  },
  {
    name: 'Add pincode to orders',
    sql: `ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS pincode TEXT;`
  },
  {
    name: 'Add total to orders',
    sql: `ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS total NUMERIC DEFAULT 0;`
  },
  {
    name: 'Add user_id to orders',
    sql: `ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS user_id TEXT;`
  },
  {
    name: 'Add status to orders',
    sql: `ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';`
  },
  {
    name: 'Add shiprocket_order_id to orders',
    sql: `ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS shiprocket_order_id TEXT;`
  },
];

async function runMigrations() {
  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });

  console.log('\n════════════════════════════════════════');
  console.log('  🚀  Sync Screen Guard — Auto Migration');
  console.log('════════════════════════════════════════');
  console.log(`📌 Project: ${projectRef}`);
  console.log(`🔗 Connecting to: db.${projectRef}.supabase.co:5432\n`);

  try {
    await client.connect();
    console.log('✅ Connected to Supabase Postgres!\n');

    let successCount = 0;
    let skipCount = 0;

    for (const m of MIGRATIONS) {
      try {
        await client.query(m.sql);
        console.log(`✅ ${m.name}`);
        successCount++;
      } catch (err) {
        if (err.message.includes('already exists') || err.code === '42701') {
          console.log(`⏭️  ${m.name} — already exists, skipped`);
          skipCount++;
        } else {
          console.warn(`⚠️  ${m.name} — ${err.message}`);
        }
      }
    }

    console.log(`\n════════════════════════════════════════`);
    console.log(`✅ Migration complete! ${successCount} applied, ${skipCount} skipped.`);
    console.log(`════════════════════════════════════════\n`);
  } catch (err) {
    console.error('\n❌ Connection failed:', err.message);
    console.log('\n💡 Possible reasons:');
    console.log('   1. DB_PASSWORD is incorrect in .env');
    console.log('   2. Supabase is blocking connections from your IP');
    console.log('\n   → Go to Supabase Dashboard → Settings → Database → Connection pooling');
    console.log('   → Or run the SQL manually in SQL Editor:');
    console.log('   ALTER TABLE public.shipments ADD COLUMN IF NOT EXISTS courier_name TEXT;');
    console.log('   ALTER TABLE public.shipments ADD COLUMN IF NOT EXISTS eta TIMESTAMPTZ;\n');
  } finally {
    await client.end();
  }
}

runMigrations();
