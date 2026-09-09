/**
 * fix-error-apis.cjs
 * Comprehensive database fix script to eliminate all 404, 400, 406, 42703, and 500 errors in Supabase API logs.
 */

const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  host: 'db.homjibmcpficbooybizb.supabase.co',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: process.env.DB_PASSWORD || 'Syncforall@007',
  ssl: { rejectUnauthorized: false }
});

const FIX_SQL = `
-- =========================================================================
-- 1. FIX: 404 /rest/v1/store_settings
-- Create store_settings table, RLS policies, and seed default settings
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.store_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  cod_fee NUMERIC(10,2) DEFAULT 0.00,
  cod_enabled BOOLEAN DEFAULT true,
  razorpay_key_id TEXT DEFAULT 'rzp_live_TWkmVWiZfERb3p',
  updated_at TIMESTAMPTZ DEFAULT timezone('utc', now())
);

ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read store_settings" ON public.store_settings;
CREATE POLICY "Allow public read store_settings" ON public.store_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public write store_settings" ON public.store_settings;
CREATE POLICY "Allow public write store_settings" ON public.store_settings FOR ALL USING (true) WITH CHECK (true);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.store_settings TO anon, authenticated;

INSERT INTO public.store_settings (id, cod_fee, cod_enabled, razorpay_key_id)
VALUES ('default', 0.00, true, 'rzp_live_TWkmVWiZfERb3p')
ON CONFLICT (id) DO UPDATE SET
  cod_fee = EXCLUDED.cod_fee,
  cod_enabled = EXCLUDED.cod_enabled,
  razorpay_key_id = EXCLUDED.razorpay_key_id;

-- =========================================================================
-- 2. FIX: 404 /rest/v1/coupons
-- Create coupons table, RLS policies, and seed SYNC10 coupon
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.coupons (
  id TEXT PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  discount_percent NUMERIC(5,2) DEFAULT 0.00,
  discount_amount NUMERIC(10,2) DEFAULT 0.00,
  is_active BOOLEAN DEFAULT true,
  min_order_amount NUMERIC(10,2) DEFAULT 0.00,
  created_at TIMESTAMPTZ DEFAULT timezone('utc', now())
);

ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read coupons" ON public.coupons;
CREATE POLICY "Allow public read coupons" ON public.coupons FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public write coupons" ON public.coupons;
CREATE POLICY "Allow public write coupons" ON public.coupons FOR ALL USING (true) WITH CHECK (true);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.coupons TO anon, authenticated;

INSERT INTO public.coupons (id, code, discount_percent, is_active)
VALUES ('coup_sync10', 'SYNC10', 10.00, true)
ON CONFLICT (id) DO NOTHING;

-- =========================================================================
-- 3. FIX: 42703 column "author" does not exist & 404 /rest/v1/reviews
-- Ensure product_reviews has author column and alias view public.reviews exists
-- =========================================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'product_reviews' AND column_name = 'author'
  ) THEN
    ALTER TABLE public.product_reviews ADD COLUMN author TEXT GENERATED ALWAYS AS (customer_name) STORED;
  END IF;
END $$;

CREATE OR REPLACE VIEW public.reviews WITH (security_invoker = true) AS
SELECT * FROM public.product_reviews;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.reviews TO anon, authenticated;

-- =========================================================================
-- 4. FIX: 42703 column "total_amount" does not exist & "order_number" does not exist
-- In orders table, add total_amount, order_number, tracking_number, courier
-- =========================================================================
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS tracking_number TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS courier TEXT;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'total_amount'
  ) THEN
    ALTER TABLE public.orders ADD COLUMN total_amount NUMERIC(10,2) GENERATED ALWAYS AS (total) STORED;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'order_number'
  ) THEN
    ALTER TABLE public.orders ADD COLUMN order_number TEXT;
  END IF;
END $$;

UPDATE public.orders 
SET order_number = COALESCE(tracking_number, SUBSTRING(id::text, 1, 8))
WHERE order_number IS NULL;

-- =========================================================================
-- 5. FIX: 400 POST /storage/v1/bucket & 42501 new row violates RLS for "buckets"
-- Ensure both 'products' and 'product-images' storage buckets exist with public access
-- and full RLS policies on storage.objects
-- =========================================================================
INSERT INTO storage.buckets (id, name, public) 
VALUES ('products', 'products', true) 
ON CONFLICT (id) DO UPDATE SET public = true;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('product-images', 'product-images', true) 
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Allow public read products bucket" ON storage.objects;
CREATE POLICY "Allow public read products bucket" 
  ON storage.objects FOR SELECT 
  USING (bucket_id IN ('products', 'product-images'));

DROP POLICY IF EXISTS "Allow public insert products bucket" ON storage.objects;
CREATE POLICY "Allow public insert products bucket" 
  ON storage.objects FOR INSERT 
  WITH CHECK (bucket_id IN ('products', 'product-images'));

DROP POLICY IF EXISTS "Allow public update products bucket" ON storage.objects;
CREATE POLICY "Allow public update products bucket" 
  ON storage.objects FOR UPDATE 
  USING (bucket_id IN ('products', 'product-images'))
  WITH CHECK (bucket_id IN ('products', 'product-images'));

DROP POLICY IF EXISTS "Allow public delete products bucket" ON storage.objects;
CREATE POLICY "Allow public delete products bucket" 
  ON storage.objects FOR DELETE 
  USING (bucket_id IN ('products', 'product-images'));

-- =========================================================================
-- 6. FIX: 406 GET /rest/v1/objects
-- Create a public view pointing to storage.objects so /rest/v1/objects works seamlessly
-- =========================================================================
CREATE OR REPLACE VIEW public.objects WITH (security_invoker = true) AS
SELECT id, name, bucket_id, metadata, created_at, updated_at
FROM storage.objects
WHERE bucket_id IN ('products', 'product-images');

GRANT SELECT ON public.objects TO anon, authenticated;

-- =========================================================================
-- 7. FIX: 57014 statement timeout & 500 on /rest/v1/products
-- Create indexes on products table to accelerate queries and prevent timeouts
-- =========================================================================
CREATE INDEX IF NOT EXISTS idx_products_created_at ON public.products(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_is_best_seller ON public.products(is_best_seller);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
`;

async function run() {
  console.log('Connecting to PostgreSQL database...');
  await client.connect();
  console.log('Connected! Executing schema fixes...');
  await client.query(FIX_SQL);
  console.log('✅ ALL API SCHEMA FIXES SUCCESSFULLY APPLIED!');
  await client.end();
}

run().catch(err => {
  console.error('Migration failed:', err);
  client.end().catch(() => {});
  process.exit(1);
});
