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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. ORDERS
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Nullable for Guest checkout
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

-- RLS POLICIES

-- Products Policies: Public Read Access
CREATE POLICY "Allow public read access to products" 
ON public.products FOR SELECT 
USING (true);

-- Orders Policies: 
-- 1. Anyone can create an order (for guest checkouts)
-- 2. Users can read their own orders (if logged in) or via order ID matching
CREATE POLICY "Allow public order placement" 
ON public.orders FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow users to read own orders" 
ON public.orders FOR SELECT 
USING (
    (auth.uid() IS NOT NULL AND user_id = auth.uid()) OR 
    (auth.uid() IS NULL) -- Allow guest users to fetch their specific order by ID on the tracking page
);

-- Order Items Policies: 
CREATE POLICY "Allow public order items creation" 
ON public.order_items FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow read access to order items" 
ON public.order_items FOR SELECT 
USING (true);

-- Payments Policies:
CREATE POLICY "Allow insert payments" 
ON public.payments FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow read payments" 
ON public.payments FOR SELECT 
USING (true);

-- Shipments Policies:
CREATE POLICY "Allow read shipments" 
ON public.shipments FOR SELECT 
USING (true);

-- ====================================================
-- AUTOMATIC STORAGE BUCKET CREATION & POLICIES
-- ====================================================

-- 1. Create the 'product-images' bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('product-images', 'product-images', true, null, null)
ON CONFLICT (id) DO NOTHING;

-- 2. Enable Storage Policies for 'product-images'
-- Allow anyone to view images (select)
CREATE POLICY "Allow public read access to product images"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

-- Allow anyone to upload images (insert)
CREATE POLICY "Allow public upload access to product images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'product-images');

