const { Client } = require('pg');

const config = {
  host: 'aws-0-ap-south-1.pooler.supabase.com',
  port: 5432,
  database: 'postgres',
  user: 'postgres.homjibmcpficbooybizb',
  password: 'sYNCFYP@007',
  ssl: { rejectUnauthorized: false },
};

const DEFAULT_PRODUCTS = [];

const SCHEMA_SQL = `
-- 1. Products table
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

-- 2. Orders table
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
    status TEXT NOT NULL DEFAULT 'pending',
    payment_type TEXT NOT NULL DEFAULT 'cod',
    total NUMERIC(10, 2) NOT NULL,
    cod_fee NUMERIC(10, 2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Order items table
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES public.products(id) ON DELETE RESTRICT NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Enable RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies for products
DROP POLICY IF EXISTS "Allow public read access to products" ON public.products;
CREATE POLICY "Allow public read access to products" ON public.products FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert to products" ON public.products;
CREATE POLICY "Allow public insert to products" ON public.products FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update to products" ON public.products;
CREATE POLICY "Allow public update to products" ON public.products FOR UPDATE USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public delete from products" ON public.products;
CREATE POLICY "Allow public delete from products" ON public.products FOR DELETE USING (true);

-- 6. RLS Policies for orders
DROP POLICY IF EXISTS "Allow public insert to orders" ON public.orders;
CREATE POLICY "Allow public insert to orders" ON public.orders FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public read access to orders" ON public.orders;
CREATE POLICY "Allow public read access to orders" ON public.orders FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public update to orders" ON public.orders;
CREATE POLICY "Allow public update to orders" ON public.orders FOR UPDATE USING (true) WITH CHECK (true);

-- 7. RLS Policies for order_items
DROP POLICY IF EXISTS "Allow public insert to order_items" ON public.order_items;
CREATE POLICY "Allow public insert to order_items" ON public.order_items FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public read access to order_items" ON public.order_items;
CREATE POLICY "Allow public read access to order_items" ON public.order_items FOR SELECT USING (true);

-- 8. Grants
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.orders TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.order_items TO anon, authenticated;
`;

async function main() {
  console.log('🔗 Connecting to Supabase Postgres...');
  const client = new Client(config);
  try {
    await client.connect();
    console.log('✅ Connected!');

    console.log('🚀 Setting up database schema & RLS policies...');
    await client.query(SCHEMA_SQL);
    console.log('✅ Schema & Policies ready!');

    // Delete test products if any
    await client.query(`DELETE FROM public.products WHERE name LIKE '%DELETE ME%'`);

    // Check count of products
    const res = await client.query(`SELECT COUNT(*) FROM public.products`);
    const count = parseInt(res.rows[0].count, 10);
    console.log(`📊 Existing product count in DB: ${count}`);

    if (count === 0) {
      console.log('🌱 Seeding default products into Supabase database...');
      for (const p of DEFAULT_PRODUCTS) {
        await client.query(
          `INSERT INTO public.products (name, category, price, original_price, description, stock, images, theme_color)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [p.name, p.category, p.price, p.original_price, p.description, p.stock, p.images, p.theme_color]
        );
        console.log(`  ✅ Seeded product: ${p.name}`);
      }
    }

    const allProducts = await client.query(`SELECT id, name, price, stock, category FROM public.products ORDER BY created_at DESC`);
    console.log('\n📦 Current Products in Supabase:');
    allProducts.rows.forEach(p => {
      console.log(`  - [${p.id}] ${p.name} | ₹${p.price} | Stock: ${p.stock}`);
    });

  } catch (err) {
    console.error('❌ Error:', err);
  } finally {
    await client.end();
  }
}

main();
