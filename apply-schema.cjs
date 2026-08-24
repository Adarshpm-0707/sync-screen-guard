// apply-schema.cjs - Applies the products table schema to Supabase
// Uses the Supabase Management API to run raw SQL

const https = require('https');

const PROJECT_REF = 'homjibmcpficbooybizb';
const ANON_KEY = 'sb_publishable_eSZnisYFqT2xPQa69GO3sw_P1tSTBtM';
const SUPABASE_URL = 'https://homjibmcpficbooybizb.supabase.co';

const SQL = `
CREATE TABLE IF NOT EXISTS public.products (
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
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access to products" ON public.products;
CREATE POLICY "Allow public read access to products" ON public.products FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert to products" ON public.products;
CREATE POLICY "Allow public insert to products" ON public.products FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update to products" ON public.products;
CREATE POLICY "Allow public update to products" ON public.products FOR UPDATE USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public delete from products" ON public.products;
CREATE POLICY "Allow public delete from products" ON public.products FOR DELETE USING (true);
`;

function httpRequest(options, body) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

async function checkTable() {
  // Try a SELECT to see if table exists
  const path = `/rest/v1/products?select=id&limit=1`;
  const result = await httpRequest({
    hostname: `${PROJECT_REF}.supabase.co`,
    path,
    method: 'GET',
    headers: {
      'apikey': ANON_KEY,
      'Authorization': `Bearer ${ANON_KEY}`,
    }
  });
  
  console.log(`GET /products status: ${result.status}`);
  console.log(`Response: ${result.body}`);
  
  if (result.status === 200) {
    console.log('\n✅ Products table EXISTS and is accessible!');
    try {
      const rows = JSON.parse(result.body);
      console.log(`   Found ${rows.length} products.`);
    } catch(e) {}
    return true;
  } else {
    const body = JSON.parse(result.body);
    console.log('\n❌ Products table issue:', body.message || result.body);
    return false;
  }
}

async function tryInsertTest() {
  const testProduct = {
    name: 'Test Product (DELETE ME)',
    price: 100,
    stock: 1,
  };
  
  const body = JSON.stringify(testProduct);
  const result = await httpRequest({
    hostname: `${PROJECT_REF}.supabase.co`,
    path: `/rest/v1/products`,
    method: 'POST',
    headers: {
      'apikey': ANON_KEY,
      'Authorization': `Bearer ${ANON_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation',
    }
  }, body);
  
  console.log(`\nPOST /products status: ${result.status}`);
  console.log(`Response: ${result.body}`);
}

async function main() {
  console.log('🔍 Checking Supabase products table...\n');
  const exists = await checkTable();
  
  if (!exists) {
    console.log('\n⚠️  The products table does not exist in your Supabase project.');
    console.log('\n📋 ACTION REQUIRED: Go to your Supabase SQL Editor and run this SQL:');
    console.log('   URL: https://supabase.com/dashboard/project/' + PROJECT_REF + '/sql/new\n');
    console.log('─'.repeat(60));
    console.log(SQL);
    console.log('─'.repeat(60));
  } else {
    console.log('\n🧪 Testing insert capability...');
    await tryInsertTest();
  }
}

main().catch(console.error);
