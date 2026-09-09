// create-products-table.cjs
// Connects directly to Supabase PostgreSQL and creates the products table + RLS policies

const { Client } = require('pg');

// Try multiple connection options
const CONNECTIONS = [
  // Session pooler (IPv4-compatible)
  {
    label: 'Session Pooler (port 5432)',
    host: 'aws-0-ap-south-1.pooler.supabase.com',
    port: 5432,
    database: 'postgres',
    user: 'postgres.homjibmcpficbooybizb',
    password: 'sYNCFYP@007',
    ssl: { rejectUnauthorized: false },
  },
  // Transaction Pooler
  {
    label: 'Transaction Pooler (port 6543)',
    host: 'aws-0-ap-south-1.pooler.supabase.com',
    port: 6543,
    database: 'postgres',
    user: 'postgres.homjibmcpficbooybizb',
    password: 'sYNCFYP@007',
    ssl: { rejectUnauthorized: false },
  },
];

const SQL = `
-- 1. Create products table
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    price NUMERIC(10, 2) NOT NULL DEFAULT 640.00,
    original_price NUMERIC(10, 2),
    images TEXT[] NOT NULL DEFAULT '{}',
    stock INTEGER NOT NULL DEFAULT 0,
    description TEXT,
    theme_color TEXT DEFAULT 'blue',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    is_best_seller BOOLEAN DEFAULT false
);

ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_best_seller BOOLEAN DEFAULT false;

-- 2. Enable RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies (drop first so re-running is safe)
DROP POLICY IF EXISTS "Allow public read access to products" ON public.products;
CREATE POLICY "Allow public read access to products"
  ON public.products FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert to products" ON public.products;
CREATE POLICY "Allow public insert to products"
  ON public.products FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update to products" ON public.products;
CREATE POLICY "Allow public update to products"
  ON public.products FOR UPDATE USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public delete from products" ON public.products;
CREATE POLICY "Allow public delete from products"
  ON public.products FOR DELETE USING (true);

-- 4. Grant access to anon and authenticated roles
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO authenticated;
`;

async function main() {
  for (const config of CONNECTIONS) {
    console.log(`\n🔗 Trying: ${config.label}...`);
    const client = new Client(config);
    try {
      await client.connect();
      console.log('✅ Connected!\n');

      console.log('🚀 Running schema migrations...\n');
      await client.query(SQL);
      console.log('✅ Schema applied successfully!\n');

      const result = await client.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'products'
        ORDER BY ordinal_position
      `);
      
      console.log('📋 Products table columns:');
      result.rows.forEach(row => {
        console.log(`   ${row.column_name.padEnd(20)} ${row.data_type}`);
      });

      const policies = await client.query(`
        SELECT policyname, cmd 
        FROM pg_policies 
        WHERE tablename = 'products' AND schemaname = 'public'
      `);
      
      console.log('\n🔒 RLS Policies:');
      policies.rows.forEach(p => {
        console.log(`   [${p.cmd}] ${p.policyname}`);
      });

      console.log('\n🎉 Done! Refresh the admin panel now.');
      await client.end();
      return; // success — stop trying
    } catch (err) {
      console.error(`❌ Failed: ${err.message}`);
      try { await client.end(); } catch(e) {}
    }
  }
  console.log('\n❌ All connection attempts failed.');
  console.log('Please run the SQL manually in the Supabase dashboard:');
  console.log('https://supabase.com/dashboard/project/homjibmcpficbooybizb/sql/new');
}

main();
