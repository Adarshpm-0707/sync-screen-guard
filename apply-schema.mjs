/**
 * apply-schema.mjs
 * Runs the Supabase schema SQL against the live database via Supabase REST API
 * Uses the service role key to bypass RLS
 */

const SUPABASE_URL = 'https://homjibmcpficbooybizb.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhvbWppYm1jcGZpY2Jvb3liaXpiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzQxODM1NCwiZXhwIjoyMDY4OTk0MzU0fQ.placeholder';

// SQL statements to create the products table and policies
const SQL_STATEMENTS = [
  // Create products table
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

  // Enable RLS
  `ALTER TABLE public.products ENABLE ROW LEVEL SECURITY`,

  // Drop and recreate policies
  `DROP POLICY IF EXISTS "Allow public read access to products" ON public.products`,
  `CREATE POLICY "Allow public read access to products" ON public.products FOR SELECT USING (true)`,

  `DROP POLICY IF EXISTS "Allow public insert to products" ON public.products`,
  `CREATE POLICY "Allow public insert to products" ON public.products FOR INSERT WITH CHECK (true)`,

  `DROP POLICY IF EXISTS "Allow public update to products" ON public.products`,
  `CREATE POLICY "Allow public update to products" ON public.products FOR UPDATE USING (true) WITH CHECK (true)`,

  `DROP POLICY IF EXISTS "Allow public delete from products" ON public.products`,
  `CREATE POLICY "Allow public delete from products" ON public.products FOR DELETE USING (true)`,
];

async function runSQL(sql) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
    },
    body: JSON.stringify({ sql }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`HTTP ${response.status}: ${body}`);
  }
  return response.json().catch(() => ({}));
}

// Alternative: use pg_dump style via the management API
async function runSQLViaMgmt(sql) {
  const projectRef = 'homjibmcpficbooybizb';
  // This uses the Supabase Management API which requires a personal access token
  // Instead, let's use the database URL directly via node-postgres
  console.log('SQL to run:', sql.substring(0, 80) + '...');
}

// Use node's built-in fetch (Node 18+)
async function applySchema() {
  const { createClient } = await import('@supabase/supabase-js');
  
  // We need to use the anon key for now and rely on the REST API
  // The cleanest approach is to use the Supabase JS client's rpc if available
  
  // Actually, let's try connecting via the database URL using node-postgres if available
  // Otherwise guide the user
  
  console.log('\n🔍 Checking if products table exists...');
  
  const ANON_KEY = 'sb_publishable_eSZnisYFqT2xPQa69GO3sw_P1tSTBtM';
  const supabase = createClient(SUPABASE_URL, ANON_KEY);
  
  const { data, error } = await supabase.from('products').select('count').limit(1);
  
  if (error && error.message.includes('schema cache')) {
    console.log('❌ Products table does NOT exist in Supabase.');
    console.log('\n📋 You need to run this SQL in your Supabase SQL Editor:');
    console.log('   https://supabase.com/dashboard/project/homjibmcpficbooybizb/sql/new\n');
    
    const sql = `-- Create products table
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

-- Enable Row Level Security
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies (PostgreSQL 15 compatible)
DROP POLICY IF EXISTS "Allow public read access to products" ON public.products;
CREATE POLICY "Allow public read access to products" ON public.products FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert to products" ON public.products;
CREATE POLICY "Allow public insert to products" ON public.products FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update to products" ON public.products;
CREATE POLICY "Allow public update to products" ON public.products FOR UPDATE USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public delete from products" ON public.products;
CREATE POLICY "Allow public delete from products" ON public.products FOR DELETE USING (true);`;

    console.log('━'.repeat(60));
    console.log(sql);
    console.log('━'.repeat(60));
  } else if (!error) {
    console.log('✅ Products table already exists! Row count result:', data);
  } else {
    console.log('⚠️  Unexpected error:', error.message);
  }
}

applySchema().catch(console.error);
