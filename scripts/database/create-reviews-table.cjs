// create-reviews-table.cjs
const { Client } = require('pg');

const SQL = `
-- 1. Create product_reviews table
CREATE TABLE IF NOT EXISTS public.product_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  rating INTEGER NOT NULL DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  comment TEXT NOT NULL,
  is_verified_buyer BOOLEAN DEFAULT true,
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_product_reviews_product_id ON public.product_reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_created_at ON public.product_reviews(created_at DESC);

-- 2. Enable RLS
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies
DROP POLICY IF EXISTS "Allow public read access to product_reviews" ON public.product_reviews;
CREATE POLICY "Allow public read access to product_reviews"
  ON public.product_reviews FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert to product_reviews" ON public.product_reviews;
CREATE POLICY "Allow public insert to product_reviews"
  ON public.product_reviews FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update to product_reviews" ON public.product_reviews;
CREATE POLICY "Allow public update to product_reviews"
  ON public.product_reviews FOR UPDATE USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public delete from product_reviews" ON public.product_reviews;
CREATE POLICY "Allow public delete from product_reviews"
  ON public.product_reviews FOR DELETE USING (true);

-- 4. Grant access to anon and authenticated roles
GRANT SELECT, INSERT, UPDATE, DELETE ON public.product_reviews TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.product_reviews TO authenticated;
`;

async function main() {
  const client = new Client({
    host: 'aws-0-ap-south-1.pooler.supabase.com',
    port: 6543,
    database: 'postgres',
    user: 'postgres.homjibmcpficbooybizb',
    password: 'Syncforall@007',
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('Connecting to database...');
    await client.connect();
    console.log('Connected! Creating product_reviews table...');
    await client.query(SQL);
    console.log('✅ product_reviews table created successfully with RLS policies and grants!');
    await client.end();
  } catch (err) {
    console.error('Error creating table:', err);
    try { await client.end(); } catch (e) {}
  }
}

main();
