-- Seed Flagship Screenguard Product
INSERT INTO public.products (id, name, price, original_price, images, stock, description)
VALUES (
    'a3c7849e-b7d1-41f2-892a-fa82f2541a7d',
    'Sync EZ Fit Glass Screenguard',
    640.00,
    999.00,
    ARRAY[
        'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?auto=format&fit=crop&q=80&w=600',
        'https://images.unsplash.com/photo-1581090464711-c30ec09b2e2d?auto=format&fit=crop&q=80&w=600',
        'https://images.unsplash.com/photo-1605236453806-6ff36851218e?auto=format&fit=crop&q=80&w=600'
    ],
    120,
    'Our premium tempered glass screenguard comes with the revolutionary EZ Fit alignment box. No alignment issues, no dust, no bubbles—just perfect, edge-to-edge application in less than 30 seconds.'
)
ON CONFLICT (id) DO UPDATE 
SET name = EXCLUDED.name,
    price = EXCLUDED.price,
    original_price = EXCLUDED.original_price,
    images = EXCLUDED.images,
    stock = EXCLUDED.stock,
    description = EXCLUDED.description;
