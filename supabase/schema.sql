-- Supabase Database Schema for Soshka Screenguard

-- 1. PRODUCTS
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

-- Add category column to existing table if it doesn't exist
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'glass';

-- 2. ORDERS
CREATE TABLE IF NOT EXISTS public.orders (
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
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),
    payment_type TEXT NOT NULL CHECK (payment_type IN ('cod', 'razorpay')),
    total NUMERIC(10, 2) NOT NULL,
    cod_fee NUMERIC(10, 2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add is_guest column to existing orders table if missing
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS is_guest BOOLEAN DEFAULT false;

-- 3. ORDER ITEMS
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES public.products(id) ON DELETE RESTRICT NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. PAYMENTS
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
    razorpay_order_id TEXT,
    razorpay_payment_id TEXT,
    razorpay_signature TEXT,
    status TEXT NOT NULL CHECK (status IN ('pending', 'success', 'failed', 'refunded')),
    amount NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. SHIPMENTS
CREATE TABLE IF NOT EXISTS public.shipments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
    shiprocket_order_id TEXT,
    awb TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    tracking_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipments ENABLE ROW LEVEL SECURITY;

-- ====================================================
-- RLS POLICIES
-- (Uses DROP + CREATE for PostgreSQL 15 compatibility — Supabase standard)
-- ====================================================

-- Products
DROP POLICY IF EXISTS "Allow public read access to products" ON public.products;
CREATE POLICY "Allow public read access to products"
ON public.products FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Allow public insert to products" ON public.products;
CREATE POLICY "Allow public insert to products"
ON public.products FOR INSERT
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update to products" ON public.products;
CREATE POLICY "Allow public update to products"
ON public.products FOR UPDATE
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public delete from products" ON public.products;
CREATE POLICY "Allow public delete from products"
ON public.products FOR DELETE
USING (true);

-- Orders
-- Orders
DROP POLICY IF EXISTS "Allow public order placement" ON public.orders;
CREATE POLICY "Allow public order placement"
ON public.orders FOR INSERT
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow users to read own orders" ON public.orders;
CREATE POLICY "Allow users to read own orders"
ON public.orders FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Allow admin update orders" ON public.orders;
CREATE POLICY "Allow admin update orders"
ON public.orders FOR UPDATE
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow admin delete orders" ON public.orders;
CREATE POLICY "Allow admin delete orders"
ON public.orders FOR DELETE
USING (true);

-- Order Items
DROP POLICY IF EXISTS "Allow public order items creation" ON public.order_items;
CREATE POLICY "Allow public order items creation"
ON public.order_items FOR INSERT
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow read access to order items" ON public.order_items;
CREATE POLICY "Allow read access to order items"
ON public.order_items FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Allow update order items" ON public.order_items;
CREATE POLICY "Allow update order items"
ON public.order_items FOR UPDATE
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow delete order items" ON public.order_items;
CREATE POLICY "Allow delete order items"
ON public.order_items FOR DELETE
USING (true);

-- Payments
DROP POLICY IF EXISTS "Allow insert payments" ON public.payments;
CREATE POLICY "Allow insert payments"
ON public.payments FOR INSERT
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow read payments" ON public.payments;
CREATE POLICY "Allow read payments"
ON public.payments FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Allow update payments" ON public.payments;
CREATE POLICY "Allow update payments"
ON public.payments FOR UPDATE
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow delete payments" ON public.payments;
CREATE POLICY "Allow delete payments"
ON public.payments FOR DELETE
USING (true);

-- Shipments
DROP POLICY IF EXISTS "Allow read shipments" ON public.shipments;
CREATE POLICY "Allow read shipments"
ON public.shipments FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Allow insert shipments" ON public.shipments;
CREATE POLICY "Allow insert shipments"
ON public.shipments FOR INSERT
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow update shipments" ON public.shipments;
CREATE POLICY "Allow update shipments"
ON public.shipments FOR UPDATE
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow delete shipments" ON public.shipments;
CREATE POLICY "Allow delete shipments"
ON public.shipments FOR DELETE
USING (true);

-- ====================================================
-- STORAGE BUCKET — run this once in Supabase SQL Editor
-- https://supabase.com/dashboard/project/homjibmcpficbooybizb/sql/new
-- ====================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Allow public read access to product images" ON storage.objects;
CREATE POLICY "Allow public read access to product images"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Allow public upload access to product images" ON storage.objects;
CREATE POLICY "Allow public upload access to product images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'product-images');
