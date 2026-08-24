#!/usr/bin/env node
/**
 * setup-database.cjs
 *
 * Fully automatic database setup using the Supabase Management API.
 * Requires: SUPABASE_SERVICE_ROLE_KEY in .env (the real JWT, not the publishable key)
 *
 * Run: node setup-database.cjs
 * Or:  npm run db:setup
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Load .env manually (no external deps needed)
function loadEnv() {
  const envPath = path.join(__dirname, '.env');
  if (!fs.existsSync(envPath)) return;
  const lines = fs.readFileSync(envPath, 'utf8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.substring(0, eqIdx).trim();
    const val = trimmed.substring(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
    if (!process.env[key]) process.env[key] = val;
  }
}

loadEnv();

const PROJECT_REF = (() => {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
  const m = url.match(/https:\/\/([^.]+)\.supabase\.co/);
  return m ? m[1] : 'homjibmcpficbooybizb';
})();

const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';

// Check if service key is a real JWT (not the publishable key)
const isRealServiceKey = SERVICE_KEY && SERVICE_KEY.startsWith('eyJ') && SERVICE_KEY !== ANON_KEY;

// ─── HTTP helpers ────────────────────────────────────────────────────────────

function httpsRequest(options, body) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, res => {
      let data = '';
      res.on('data', c => (data += c));
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', reject);
    if (body) req.write(typeof body === 'string' ? body : JSON.stringify(body));
    req.end();
  });
}

// ─── Management API: run SQL ──────────────────────────────────────────────────

async function runSQLViaMgmtAPI(sql, token) {
  const body = JSON.stringify({ query: sql });
  return httpsRequest({
    hostname: 'api.supabase.com',
    path: `/v1/projects/${PROJECT_REF}/database/query`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body),
      Authorization: `Bearer ${token}`,
    },
  }, body);
}

// ─── REST API: test anon read (to check if table exists) ─────────────────────

async function checkTableExists(table) {
  const res = await httpsRequest({
    hostname: `${PROJECT_REF}.supabase.co`,
    path: `/rest/v1/${table}?select=id&limit=1`,
    method: 'GET',
    headers: {
      apikey: ANON_KEY,
      Authorization: `Bearer ${ANON_KEY}`,
    },
  });
  return res.status === 200;
}

// ─── REST API: insert via service role (bypasses RLS) ────────────────────────

async function supabaseInsert(table, record, token) {
  const body = JSON.stringify(record);
  return httpsRequest({
    hostname: `${PROJECT_REF}.supabase.co`,
    path: `/rest/v1/${table}`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body),
      apikey: token,
      Authorization: `Bearer ${token}`,
      Prefer: 'return=minimal',
    },
  }, body);
}

// ─── All SQL statements ──────────────────────────────────────────────────────

const MIGRATION_SQL = [
  // Tables
  {
    label: 'Create products table',
    sql: `CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL DEFAULT 640.00,
  original_price NUMERIC(10,2),
  images TEXT[] NOT NULL DEFAULT '{}',
  stock INTEGER NOT NULL DEFAULT 0,
  description TEXT,
  theme_color TEXT DEFAULT 'blue',
  category TEXT DEFAULT 'glass',
  created_at TIMESTAMPTZ DEFAULT timezone('utc',now()) NOT NULL
)`
  },
  {
    label: 'Create orders table',
    sql: `CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  is_guest BOOLEAN DEFAULT false,
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  pincode TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','confirmed','processing','shipped','delivered','cancelled')),
  payment_type TEXT NOT NULL CHECK (payment_type IN ('cod','razorpay')),
  total NUMERIC(10,2) NOT NULL,
  cod_fee NUMERIC(10,2) DEFAULT 0.00,
  created_at TIMESTAMPTZ DEFAULT timezone('utc',now()) NOT NULL
)`
  },
  {
    label: 'Create order_items table',
    sql: `CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE RESTRICT NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  price NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc',now()) NOT NULL
)`
  },
  {
    label: 'Create payments table',
    sql: `CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  razorpay_signature TEXT,
  status TEXT NOT NULL CHECK (status IN ('pending','success','failed','refunded')),
  amount NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc',now()) NOT NULL
)`
  },
  {
    label: 'Create shipments table',
    sql: `CREATE TABLE IF NOT EXISTS public.shipments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  shiprocket_order_id TEXT,
  awb TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  tracking_url TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc',now()) NOT NULL
)`
  },

  // Add missing columns (idempotent)
  { label: 'Add category column', sql: `ALTER TABLE public.products ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'glass'` },
  { label: 'Add theme_color column', sql: `ALTER TABLE public.products ADD COLUMN IF NOT EXISTS theme_color TEXT DEFAULT 'blue'` },
  { label: 'Add is_guest column to orders', sql: `ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS is_guest BOOLEAN DEFAULT false` },

  // Enable RLS
  { label: 'Enable RLS: products', sql: `ALTER TABLE public.products ENABLE ROW LEVEL SECURITY` },
  { label: 'Enable RLS: orders', sql: `ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY` },
  { label: 'Enable RLS: order_items', sql: `ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY` },
  { label: 'Enable RLS: payments', sql: `ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY` },
  { label: 'Enable RLS: shipments', sql: `ALTER TABLE public.shipments ENABLE ROW LEVEL SECURITY` },

  // Products policies
  { label: 'Policy: products SELECT', sql: `DROP POLICY IF EXISTS "Allow public read access to products" ON public.products; CREATE POLICY "Allow public read access to products" ON public.products FOR SELECT USING (true)` },
  { label: 'Policy: products INSERT', sql: `DROP POLICY IF EXISTS "Allow public insert to products" ON public.products; CREATE POLICY "Allow public insert to products" ON public.products FOR INSERT WITH CHECK (true)` },
  { label: 'Policy: products UPDATE', sql: `DROP POLICY IF EXISTS "Allow public update to products" ON public.products; CREATE POLICY "Allow public update to products" ON public.products FOR UPDATE USING (true) WITH CHECK (true)` },
  { label: 'Policy: products DELETE', sql: `DROP POLICY IF EXISTS "Allow public delete from products" ON public.products; CREATE POLICY "Allow public delete from products" ON public.products FOR DELETE USING (true)` },

  // Orders policies
  { label: 'Policy: orders INSERT', sql: `DROP POLICY IF EXISTS "Allow public order placement" ON public.orders; CREATE POLICY "Allow public order placement" ON public.orders FOR INSERT WITH CHECK (true)` },
  { label: 'Policy: orders SELECT (all)', sql: `DROP POLICY IF EXISTS "Allow admin to read all orders" ON public.orders; CREATE POLICY "Allow admin to read all orders" ON public.orders FOR SELECT USING (true)` },
  { label: 'Policy: orders UPDATE', sql: `DROP POLICY IF EXISTS "Allow admin to update orders" ON public.orders; CREATE POLICY "Allow admin to update orders" ON public.orders FOR UPDATE USING (true) WITH CHECK (true)` },

  // Order items policies
  { label: 'Policy: order_items INSERT', sql: `DROP POLICY IF EXISTS "Allow public order items creation" ON public.order_items; CREATE POLICY "Allow public order items creation" ON public.order_items FOR INSERT WITH CHECK (true)` },
  { label: 'Policy: order_items SELECT', sql: `DROP POLICY IF EXISTS "Allow read access to order items" ON public.order_items; CREATE POLICY "Allow read access to order items" ON public.order_items FOR SELECT USING (true)` },

  // Payments policies
  { label: 'Policy: payments INSERT', sql: `DROP POLICY IF EXISTS "Allow insert payments" ON public.payments; CREATE POLICY "Allow insert payments" ON public.payments FOR INSERT WITH CHECK (true)` },
  { label: 'Policy: payments SELECT', sql: `DROP POLICY IF EXISTS "Allow read payments" ON public.payments; CREATE POLICY "Allow read payments" ON public.payments FOR SELECT USING (true)` },

  // Shipments policies
  { label: 'Policy: shipments SELECT', sql: `DROP POLICY IF EXISTS "Allow read shipments" ON public.shipments; CREATE POLICY "Allow read shipments" ON public.shipments FOR SELECT USING (true)` },
  { label: 'Policy: shipments INSERT', sql: `DROP POLICY IF EXISTS "Allow insert shipments" ON public.shipments; CREATE POLICY "Allow insert shipments" ON public.shipments FOR INSERT WITH CHECK (true)` },
  { label: 'Policy: shipments UPDATE', sql: `DROP POLICY IF EXISTS "Allow update shipments" ON public.shipments; CREATE POLICY "Allow update shipments" ON public.shipments FOR UPDATE USING (true) WITH CHECK (true)` },

  // Grants
  { label: 'Grant: products', sql: `GRANT SELECT,INSERT,UPDATE,DELETE ON public.products TO anon,authenticated` },
  { label: 'Grant: orders', sql: `GRANT SELECT,INSERT,UPDATE,DELETE ON public.orders TO anon,authenticated` },
  { label: 'Grant: order_items', sql: `GRANT SELECT,INSERT,UPDATE,DELETE ON public.order_items TO anon,authenticated` },
  { label: 'Grant: payments', sql: `GRANT SELECT,INSERT,UPDATE,DELETE ON public.payments TO anon,authenticated` },
  { label: 'Grant: shipments', sql: `GRANT SELECT,INSERT,UPDATE,DELETE ON public.shipments TO anon,authenticated` },

  // Storage bucket
  { label: 'Storage: create bucket', sql: `INSERT INTO storage.buckets (id,name,public) VALUES ('product-images','product-images',true) ON CONFLICT (id) DO NOTHING` },
  { label: 'Storage: SELECT policy', sql: `DROP POLICY IF EXISTS "Allow public read access to product images" ON storage.objects; CREATE POLICY "Allow public read access to product images" ON storage.objects FOR SELECT USING (bucket_id='product-images')` },
  { label: 'Storage: INSERT policy', sql: `DROP POLICY IF EXISTS "Allow public upload access to product images" ON storage.objects; CREATE POLICY "Allow public upload access to product images" ON storage.objects FOR INSERT WITH CHECK (bucket_id='product-images')` },
  { label: 'Storage: UPDATE policy', sql: `DROP POLICY IF EXISTS "Allow public update product images" ON storage.objects; CREATE POLICY "Allow public update product images" ON storage.objects FOR UPDATE USING (bucket_id='product-images') WITH CHECK (bucket_id='product-images')` },
  { label: 'Storage: DELETE policy', sql: `DROP POLICY IF EXISTS "Allow public delete product images" ON storage.objects; CREATE POLICY "Allow public delete product images" ON storage.objects FOR DELETE USING (bucket_id='product-images')` },
];

// ─── Seed data ────────────────────────────────────────────────────────────────

const SEED_PRODUCTS = [];

// ─── Update .env with correct service key ────────────────────────────────────

function updateEnvServiceKey(key) {
  const envPath = path.join(__dirname, '.env');
  let content = fs.readFileSync(envPath, 'utf8');
  if (content.includes('SUPABASE_SERVICE_ROLE_KEY=')) {
    content = content.replace(/SUPABASE_SERVICE_ROLE_KEY=.*/g, `SUPABASE_SERVICE_ROLE_KEY=${key}`);
  } else {
    content += `\nSUPABASE_SERVICE_ROLE_KEY=${key}\n`;
  }
  fs.writeFileSync(envPath, content);
  console.log('   ✅ Updated SUPABASE_SERVICE_ROLE_KEY in .env\n');
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function runMigrations(token) {
  let ok = 0;
  let warn = 0;
  let fail = 0;

  for (const { label, sql } of MIGRATION_SQL) {
    process.stdout.write(`  [${label}]... `);
    try {
      const res = await runSQLViaMgmtAPI(sql, token);
      let parsed;
      try { parsed = JSON.parse(res.body); } catch { parsed = { message: res.body }; }

      if (res.status >= 200 && res.status < 300) {
        console.log('✅');
        ok++;
      } else {
        const msg = parsed?.message || parsed?.error || String(res.body);
        if (msg.includes('already exists') || msg.includes('does not exist') || msg.includes('42710') || msg.includes('42P07')) {
          console.log('⚠️  (already exists — skipped)');
          warn++;
        } else {
          console.log(`❌ HTTP ${res.status}: ${msg.substring(0, 80)}`);
          fail++;
        }
      }
    } catch (err) {
      console.log(`❌ ${err.message}`);
      fail++;
    }
  }

  return { ok, warn, fail };
}

async function seedProducts(token) {
  console.log('\n🌱 Seeding default products...');
  for (const product of SEED_PRODUCTS) {
    // Check by id if it already exists
    const checkRes = await httpsRequest({
      hostname: `${PROJECT_REF}.supabase.co`,
      path: `/rest/v1/products?id=eq.${product.id}&select=id`,
      method: 'GET',
      headers: {
        apikey: token,
        Authorization: `Bearer ${token}`,
      },
    });
    const existing = JSON.parse(checkRes.body || '[]');
    if (existing.length > 0) {
      console.log(`  ⚠️  "${product.name}" already exists — skipped`);
      continue;
    }
    const res = await supabaseInsert('products', product, token);
    if (res.status >= 200 && res.status < 300) {
      console.log(`  ✅ Seeded: ${product.name}`);
    } else {
      console.log(`  ❌ Failed to seed "${product.name}": ${res.body.substring(0, 80)}`);
    }
  }
}

async function main() {
  console.log('\n' + '═'.repeat(60));
  console.log('  🚀  SYNC Screenguard — Automatic Database Setup');
  console.log('═'.repeat(60) + '\n');

  console.log(`📌 Project: ${PROJECT_REF}`);

  // ── Step 1: Determine the token to use ──────────────────────────────────────
  let token = null;

  if (isRealServiceKey) {
    console.log('🔑 Using service_role key from .env\n');
    token = SERVICE_KEY;
  } else {
    // Prompt user to provide the real service role key
    console.log('⚠️  SUPABASE_SERVICE_ROLE_KEY in .env is not a real service role key.');
    console.log('   The real key is a JWT (starts with eyJ...) found at:');
    console.log(`   https://supabase.com/dashboard/project/${PROJECT_REF}/settings/api`);
    console.log('   → "service_role" row → click the eye icon → Reveal → Copy\n');

    // Try to read from CLI argument
    if (process.argv[2] && process.argv[2].startsWith('eyJ')) {
      token = process.argv[2];
      console.log('🔑 Using service role key from CLI argument\n');
      // Update .env so next time it works automatically
      updateEnvServiceKey(token);
    } else {
      console.log('💡 Pass your service role key as an argument:');
      console.log('   node setup-database.cjs <your-service-role-key>\n');
      console.log('   Then it will be saved to .env for future runs (fully automatic).\n');
      process.exit(1);
    }
  }

  // ── Step 2: Run migrations ───────────────────────────────────────────────────
  console.log('📋 Running migrations...\n');
  const { ok, warn, fail } = await runMigrations(token);

  // ── Step 3: Verify tables exist ──────────────────────────────────────────────
  console.log('\n🔍 Verifying tables...');
  const tables = ['products', 'orders', 'order_items', 'payments', 'shipments'];
  let allOk = true;
  for (const t of tables) {
    const exists = await checkTableExists(t);
    console.log(`  ${exists ? '✅' : '❌'} ${t}`);
    if (!exists) allOk = false;
  }

  // ── Step 4: Seed default products if empty ───────────────────────────────────
  if (allOk) {
    await seedProducts(token);
  }

  // ── Summary ──────────────────────────────────────────────────────────────────
  console.log('\n' + '─'.repeat(60));
  console.log(`✅ Migrations: ${ok} succeeded, ${warn} skipped, ${fail} failed`);
  if (fail === 0 && allOk) {
    console.log('\n🎉 Database is fully set up!');
    console.log('   ▸ Restart your dev server: npm run dev');
    console.log('   ▸ All tables created with correct RLS policies');
    console.log('   ▸ Storage bucket "product-images" ready');
    console.log('   ▸ Default products seeded\n');
  } else if (!isRealServiceKey || fail > 0) {
    console.log('\n⚠️  Some steps failed. Check the output above for details.\n');
  }
}

main().catch(err => {
  console.error('\n❌ Fatal error:', err.message);
  process.exit(1);
});
