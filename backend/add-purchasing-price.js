import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const dbPassword = process.env.DB_PASSWORD;
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const match = supabaseUrl.match(/https:\/\/(.*?)\.supabase\.co/);
const projectRef = match ? match[1] : '';

// Try direct connection first (port 5432), then session pooler (6543)
const directHost = `db.${projectRef}.supabase.co`;
const poolerHost = 'aws-0-ap-south-1.pooler.supabase.com';
const directUser = 'postgres';
const poolerUser = `postgres.${projectRef}`;
const dbPort = '5432';

console.log(`\n🔧 Connecting to Supabase Postgres...`);
console.log(`   Project : ${projectRef}`);
console.log(`   Trying  : ${directHost}:5432\n`);

async function tryConnect(host, user, port) {
  const connStr = `postgresql://${user}:${encodeURIComponent(dbPassword)}@${host}:${port}/postgres`;
  const c = new pg.Client({ connectionString: connStr, ssl: { rejectUnauthorized: false } });
  await c.connect();
  return c;
}

async function run() {
  // Try direct host first, then pooler
  const attempts = [
    { host: directHost, user: directUser, port: '5432' },
    { host: poolerHost, user: poolerUser, port: '5432' },
    { host: poolerHost, user: poolerUser, port: '6543' },
    { host: directHost, user: directUser, port: '6543' },
  ];

  let client = null;
  for (const { host, user, port } of attempts) {
    try {
      process.stdout.write(`   Trying ${user}@${host}:${port} ... `);
      client = await tryConnect(host, user, port);
      console.log('✅ Connected!');
      break;
    } catch (e) {
      console.log(`❌ ${e.message.slice(0, 60)}`);
      client = null;
    }
  }

  if (!client) {
    console.error('\n❌ Could not connect with any combination.');
    console.error('Please paste your correct DB_PASSWORD from:');
    console.error(`https://supabase.com/dashboard/project/${projectRef}/settings/database\n`);
    process.exit(1);
  }

  try {
    console.log('');
    await client.query(`ALTER TABLE public.products ADD COLUMN IF NOT EXISTS purchasing_price NUMERIC(10, 2) DEFAULT NULL;`);
    console.log('✅ Column "purchasing_price" added to products table!');

    await client.query(`ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_best_seller BOOLEAN DEFAULT false;`);
    console.log('✅ Column "is_best_seller" ensured.');

    await client.query(`ALTER TABLE public.products ADD COLUMN IF NOT EXISTS show_on_home BOOLEAN DEFAULT true;`);
    console.log('✅ Column "show_on_home" ensured.');

    await client.query(`SELECT purchasing_price FROM public.products LIMIT 1;`);
    console.log('\n🎉 Migration complete! Refresh your admin panel — purchasing price will now save correctly.\n');
  } catch (err) {
    if (err.message.includes('already exists')) {
      console.log('✅ All columns already exist — no changes needed!');
    } else {
      console.error('❌ Migration error:', err.message);
    }
  } finally {
    await client.end();
  }
}

run();
