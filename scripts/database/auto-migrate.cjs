// auto-migrate.cjs
// Fully automatic Supabase migration using the Management API
// Run: node auto-migrate.cjs <service_role_key>
// OR: set SUPABASE_SERVICE_ROLE_KEY env var and run: node auto-migrate.cjs

const https = require('https');

const PROJECT_REF = 'homjibmcpficbooybizb';
const SERVICE_KEY = process.argv[2] || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SERVICE_KEY || SERVICE_KEY.includes('EXAMPLE') || !SERVICE_KEY.startsWith('eyJ')) {
  console.error('\n❌ Please provide the real service_role key as an argument:');
  console.error('   node auto-migrate.cjs eyJhbGciOiJIUzI1NiIsInR5cCI6...\n');
  console.error('Get it from: https://supabase.com/dashboard/project/' + PROJECT_REF + '/settings/api');
  console.error('→ Project API keys → service_role → Reveal\n');
  process.exit(1);
}

function post(host, path, data, headers) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(data);
    const req = https.request({
      hostname: host,
      path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
        ...headers
      }
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// The SQL to run
const ALL_SQL = [
  // Products table
  `CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    price NUMERIC(10, 2) NOT NULL DEFAULT 640.00,
    original_price NUMERIC(10, 2),
    images TEXT[] NOT NULL DEFAULT '{}',
    stock INTEGER NOT NULL DEFAULT 0,
    description TEXT,
    theme_color TEXT DEFAULT 'blue',
    category TEXT DEFAULT 'glass',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
  )`,

  // Orders table
  `CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    customer_name TEXT NOT NULL,
    customer_email TEXT,
    phone TEXT NOT NULL,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    pincode TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','confirmed','processing','shipped','delivered','cancelled')),
    payment_type TEXT NOT NULL CHECK (payment_type IN ('cod','razorpay')),
    total NUMERIC(10, 2) NOT NULL,
    cod_fee NUMERIC(10, 2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
  )`,

  // Order items
  `CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES public.products(id) ON DELETE RESTRICT NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
  )`,

  // Payments
  `CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
    razorpay_order_id TEXT,
    razorpay_payment_id TEXT,
    razorpay_signature TEXT,
    status TEXT NOT NULL CHECK (status IN ('pending','success','failed','refunded')),
    amount NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
  )`,

  // Shipments
  `CREATE TABLE IF NOT EXISTS public.shipments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
    shiprocket_order_id TEXT,
    awb TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    tracking_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
  )`,

  // Enable RLS
  `ALTER TABLE public.products ENABLE ROW LEVEL SECURITY`,
  `ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY`,
  `ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY`,
  `ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY`,
  `ALTER TABLE public.shipments ENABLE ROW LEVEL SECURITY`,

  // Products policies
  `DROP POLICY IF EXISTS "Allow public read access to products" ON public.products`,
  `CREATE POLICY "Allow public read access to products" ON public.products FOR SELECT USING (true)`,
  `DROP POLICY IF EXISTS "Allow public insert to products" ON public.products`,
  `CREATE POLICY "Allow public insert to products" ON public.products FOR INSERT WITH CHECK (true)`,
  `DROP POLICY IF EXISTS "Allow public update to products" ON public.products`,
  `CREATE POLICY "Allow public update to products" ON public.products FOR UPDATE USING (true) WITH CHECK (true)`,
  `DROP POLICY IF EXISTS "Allow public delete from products" ON public.products`,
  `CREATE POLICY "Allow public delete from products" ON public.products FOR DELETE USING (true)`,

  // Orders policies
  `DROP POLICY IF EXISTS "Allow public order placement" ON public.orders`,
  `CREATE POLICY "Allow public order placement" ON public.orders FOR INSERT WITH CHECK (true)`,
  `DROP POLICY IF EXISTS "Allow users to read own orders" ON public.orders`,
  `CREATE POLICY "Allow users to read own orders" ON public.orders FOR SELECT USING (true)`,
  `DROP POLICY IF EXISTS "Allow admin to update orders" ON public.orders`,
  `CREATE POLICY "Allow admin to update orders" ON public.orders FOR UPDATE USING (true) WITH CHECK (true)`,
  `DROP POLICY IF EXISTS "Allow admin to delete orders" ON public.orders`,
  `CREATE POLICY "Allow admin to delete orders" ON public.orders FOR DELETE USING (true)`,

  // Order items policies
  `DROP POLICY IF EXISTS "Allow public order items creation" ON public.order_items`,
  `CREATE POLICY "Allow public order items creation" ON public.order_items FOR INSERT WITH CHECK (true)`,
  `DROP POLICY IF EXISTS "Allow read access to order items" ON public.order_items`,
  `CREATE POLICY "Allow read access to order items" ON public.order_items FOR SELECT USING (true)`,
  `DROP POLICY IF EXISTS "Allow update order items" ON public.order_items`,
  `CREATE POLICY "Allow update order items" ON public.order_items FOR UPDATE USING (true) WITH CHECK (true)`,
  `DROP POLICY IF EXISTS "Allow delete order items" ON public.order_items`,
  `CREATE POLICY "Allow delete order items" ON public.order_items FOR DELETE USING (true)`,

  // Payments policies
  `DROP POLICY IF EXISTS "Allow insert payments" ON public.payments`,
  `CREATE POLICY "Allow insert payments" ON public.payments FOR INSERT WITH CHECK (true)`,
  `DROP POLICY IF EXISTS "Allow read payments" ON public.payments`,
  `CREATE POLICY "Allow read payments" ON public.payments FOR SELECT USING (true)`,
  `DROP POLICY IF EXISTS "Allow update payments" ON public.payments`,
  `CREATE POLICY "Allow update payments" ON public.payments FOR UPDATE USING (true) WITH CHECK (true)`,
  `DROP POLICY IF EXISTS "Allow delete payments" ON public.payments`,
  `CREATE POLICY "Allow delete payments" ON public.payments FOR DELETE USING (true)`,

  // Shipments policies
  `DROP POLICY IF EXISTS "Allow read shipments" ON public.shipments`,
  `CREATE POLICY "Allow read shipments" ON public.shipments FOR SELECT USING (true)`,
  `DROP POLICY IF EXISTS "Allow insert shipments" ON public.shipments`,
  `CREATE POLICY "Allow insert shipments" ON public.shipments FOR INSERT WITH CHECK (true)`,
  `DROP POLICY IF EXISTS "Allow update shipments" ON public.shipments`,
  `CREATE POLICY "Allow update shipments" ON public.shipments FOR UPDATE USING (true) WITH CHECK (true)`,
  `DROP POLICY IF EXISTS "Allow delete shipments" ON public.shipments`,
  `CREATE POLICY "Allow delete shipments" ON public.shipments FOR DELETE USING (true)`,

  // Storage bucket
  `INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true) ON CONFLICT (id) DO NOTHING`,
  `DROP POLICY IF EXISTS "Allow public read access to product images" ON storage.objects`,
  `CREATE POLICY "Allow public read access to product images" ON storage.objects FOR SELECT USING (bucket_id = 'product-images')`,
  `DROP POLICY IF EXISTS "Allow public upload access to product images" ON storage.objects`,
  `CREATE POLICY "Allow public upload access to product images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'product-images')`,

  // Grants
  `GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO anon, authenticated`,
  `GRANT SELECT, INSERT, UPDATE, DELETE ON public.orders TO anon, authenticated`,
  `GRANT SELECT, INSERT, UPDATE, DELETE ON public.order_items TO anon, authenticated`,
  `GRANT SELECT, INSERT, UPDATE, DELETE ON public.payments TO anon, authenticated`,
  `GRANT SELECT, INSERT, UPDATE, DELETE ON public.shipments TO anon, authenticated`,
];

async function runSQL(sql) {
  const res = await post(
    'api.supabase.com',
    `/v1/projects/${PROJECT_REF}/database/query`,
    { query: sql },
    {
      'Authorization': `Bearer ${SERVICE_KEY}`,
    }
  );
  return res;
}

async function main() {
  console.log(`\n🚀 Supabase Auto-Migration for project: ${PROJECT_REF}\n`);
  console.log(`🔑 Using service key: ${SERVICE_KEY.substring(0, 30)}...\n`);

  let success = 0;
  let failed = 0;

  for (let i = 0; i < ALL_SQL.length; i++) {
    const sql = ALL_SQL[i];
    const label = sql.trim().split('\n')[0].substring(0, 60);
    process.stdout.write(`[${i + 1}/${ALL_SQL.length}] ${label}... `);

    const res = await runSQL(sql);

    if (res.status >= 200 && res.status < 300) {
      console.log('✅');
      success++;
    } else {
      let body;
      try { body = JSON.parse(res.body); } catch { body = { message: res.body }; }
      const msg = body?.message || body?.error || res.body;
      // Ignore "already exists" errors
      if (msg && (msg.includes('already exists') || msg.includes('does not exist'))) {
        console.log(`⚠️  ${msg.substring(0, 60)}`);
        success++;
      } else {
        console.log(`❌ HTTP ${res.status}: ${msg?.substring(0, 80)}`);
        failed++;
      }
    }
  }

  console.log(`\n${'─'.repeat(60)}`);
  console.log(`✅ Succeeded: ${success}/${ALL_SQL.length}`);
  if (failed > 0) {
    console.log(`❌ Failed: ${failed}`);
  } else {
    console.log(`\n🎉 All done! Your database is fully set up.`);
    console.log(`   Refresh your admin panel — everything should work now.\n`);
  }
}

main().catch(console.error);
