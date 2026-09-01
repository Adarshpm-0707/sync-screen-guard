-- ============================================================
-- Initial schema: all tables, RLS policies, grants, storage
-- ============================================================

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
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'glass';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS theme_color TEXT DEFAULT 'blue';

-- 2. ORDERS
CREATE TABLE IF NOT EXISTS public.orders (
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
);

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
    status TEXT NOT NULL CHECK (status IN ('pending','success','failed','refunded')),
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

-- ============================================================
-- Enable Row Level Security
-- ============================================================
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipments ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- RLS POLICIES (PostgreSQL 15 compatible: DROP + CREATE)
-- ============================================================

-- Products
DROP POLICY IF EXISTS "Allow public read access to products" ON public.products;
CREATE POLICY "Allow public read access to products" ON public.products FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert to products" ON public.products;
CREATE POLICY "Allow public insert to products" ON public.products FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update to products" ON public.products;
CREATE POLICY "Allow public update to products" ON public.products FOR UPDATE USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public delete from products" ON public.products;
CREATE POLICY "Allow public delete from products" ON public.products FOR DELETE USING (true);

-- Orders
DROP POLICY IF EXISTS "Allow public order placement" ON public.orders;
CREATE POLICY "Allow public order placement" ON public.orders FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow users to read own orders" ON public.orders;
CREATE POLICY "Allow users to read own orders" ON public.orders FOR SELECT
USING ((auth.uid() IS NOT NULL AND user_id = auth.uid()) OR (auth.uid() IS NULL));

DROP POLICY IF EXISTS "Allow admin to read all orders" ON public.orders;
CREATE POLICY "Allow admin to read all orders" ON public.orders FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow admin to update orders" ON public.orders;
CREATE POLICY "Allow admin to update orders" ON public.orders FOR UPDATE USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow admin to delete orders" ON public.orders;
CREATE POLICY "Allow admin to delete orders" ON public.orders FOR DELETE USING (true);

-- Order Items
DROP POLICY IF EXISTS "Allow public order items creation" ON public.order_items;
CREATE POLICY "Allow public order items creation" ON public.order_items FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow read access to order items" ON public.order_items;
CREATE POLICY "Allow read access to order items" ON public.order_items FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow update order items" ON public.order_items;
CREATE POLICY "Allow update order items" ON public.order_items FOR UPDATE USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow delete order items" ON public.order_items;
CREATE POLICY "Allow delete order items" ON public.order_items FOR DELETE USING (true);

-- Payments
DROP POLICY IF EXISTS "Allow insert payments" ON public.payments;
CREATE POLICY "Allow insert payments" ON public.payments FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow read payments" ON public.payments;
CREATE POLICY "Allow read payments" ON public.payments FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow update payments" ON public.payments;
CREATE POLICY "Allow update payments" ON public.payments FOR UPDATE USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow delete payments" ON public.payments;
CREATE POLICY "Allow delete payments" ON public.payments FOR DELETE USING (true);

-- Shipments
DROP POLICY IF EXISTS "Allow read shipments" ON public.shipments;
CREATE POLICY "Allow read shipments" ON public.shipments FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow insert shipments" ON public.shipments;
CREATE POLICY "Allow insert shipments" ON public.shipments FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow update shipments" ON public.shipments;
CREATE POLICY "Allow update shipments" ON public.shipments FOR UPDATE USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow delete shipments" ON public.shipments;
CREATE POLICY "Allow delete shipments" ON public.shipments FOR DELETE USING (true);

-- ============================================================
-- Grants for anon + authenticated roles
-- ============================================================
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.orders TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.orders TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.order_items TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.order_items TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.payments TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.payments TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.shipments TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.shipments TO authenticated;

-- ============================================================
-- Storage bucket for product images
-- ============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Allow public read access to product images" ON storage.objects;
CREATE POLICY "Allow public read access to product images"
ON storage.objects FOR SELECT USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Allow public upload access to product images" ON storage.objects;
CREATE POLICY "Allow public upload access to product images"
ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Allow public update product images" ON storage.objects;
CREATE POLICY "Allow public update product images"
ON storage.objects FOR UPDATE USING (bucket_id = 'product-images') WITH CHECK (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Allow public delete product images" ON storage.objects;
CREATE POLICY "Allow public delete product images"
ON storage.objects FOR DELETE USING (bucket_id = 'product-images');
