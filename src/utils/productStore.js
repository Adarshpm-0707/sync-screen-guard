import { supabase } from '../supabaseClient';

export const DEFAULT_PRODUCTS = [
  {
    id: 'sync-ez-fit-iphone-15-pro-max',
    name: 'Sync EZ Fit Tempered Glass - iPhone 15 Pro / Pro Max',
    price: 640.00,
    original_price: 1299.00,
    category: 'glass',
    images: [
      'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1581090464711-c30ec09b2e2d?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1605236453806-6ff36851218e?auto=format&fit=crop&q=80&w=600'
    ],
    stock: 150,
    is_best_seller: true,
    show_on_home: true,
    description: 'Flagship 9H tempered glass featuring revolutionary auto-alignment box applicator. Dust-free, bubble-free 10-second installation with oleophobic anti-fingerprint coating.'
  },
  {
    id: 'sync-privacy-armor-iphone-series',
    name: 'Sync Privacy Armor Glass - iPhone 15 / 14 / 13',
    price: 740.00,
    original_price: 1499.00,
    category: 'privacy',
    images: [
      'https://images.unsplash.com/photo-1605236453806-6ff36851218e?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?auto=format&fit=crop&q=80&w=600'
    ],
    stock: 90,
    is_best_seller: true,
    show_on_home: true,
    description: '28-degree narrow-angle anti-spy privacy screen protector. Prevents side viewing while retaining HD visual clarity and touch response.'
  },
  {
    id: 'sync-ez-fit-samsung-s24-ultra',
    name: 'Sync EZ Fit Tempered Glass - Samsung Galaxy S24 / S23 Ultra',
    price: 690.00,
    original_price: 1399.00,
    category: 'samsung',
    images: [
      'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1581090464711-c30ec09b2e2d?auto=format&fit=crop&q=80&w=600'
    ],
    stock: 120,
    is_best_seller: true,
    show_on_home: true,
    description: 'Curved edge 9H glass engineered specifically for Samsung Galaxy flagships. Includes 10-second alignment applicator.'
  },
  {
    id: 'sync-matte-anti-glare-shield',
    name: 'Sync Matte Anti-Glare Armor Glass - Universal Fit',
    price: 680.00,
    original_price: 1299.00,
    category: 'matte',
    images: [
      'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?auto=format&fit=crop&q=80&w=600'
    ],
    stock: 80,
    is_best_seller: false,
    show_on_home: true,
    description: 'Smooth silk-finish anti-glare glass designed for gaming and outdoor usage. Eliminates reflections and smudges effortlessly.'
  },
  {
    id: 'sync-ez-fit-oneplus-12-11',
    name: 'Sync EZ Fit Tempered Glass - OnePlus 12 / 11 / Nord Series',
    price: 590.00,
    original_price: 1199.00,
    category: 'oneplus',
    images: [
      'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1581090464711-c30ec09b2e2d?auto=format&fit=crop&q=80&w=600'
    ],
    stock: 110,
    is_best_seller: false,
    show_on_home: true,
    description: 'High-impact glass protector with electroplated oleophobic coating and custom alignment tray for OnePlus smartphones.'
  }
];

export async function fetchStoreProducts() {
  // Clean up any test product from local storage
  try {
    const localArr = JSON.parse(localStorage.getItem('local_added_products') || '[]');
    const cleaned = localArr.filter(
      p => p && !p.name?.toLowerCase().includes('emrpemmrpg') && Number(p.price) !== 200 && Number(p.original_price) !== 5000
    );
    if (cleaned.length !== localArr.length) {
      localStorage.setItem('local_added_products', JSON.stringify(cleaned));
    }
  } catch (e) {}

  // 1. Fetch directly from Supabase products table
  let dbProducts = [];
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data && data.length > 0) {
      dbProducts = data;
    }
  } catch (e) {
    console.warn('Supabase fetch error:', e);
  }

  // 2. Get local admin-added products (from Admin Panel additions)
  let localAdded = [];
  try {
    localAdded = JSON.parse(localStorage.getItem('local_added_products') || '[]');
  } catch (e) {
    localAdded = [];
  }

  // Combine: localAdded takes priority over dbProducts (no DEFAULT_PRODUCTS — only admin-added products)
  const combined = [
    ...localAdded,
    ...dbProducts,
  ];

  // 3. Deduplicate by product ID & normalize properties
  const map = new Map();
  combined.forEach(p => {
    if (p && p.id && !map.has(p.id)) {
      const imagesArr = Array.isArray(p.images) ? p.images : (p.images ? [p.images] : []);
      map.set(p.id, {
        ...p,
        images: imagesArr.length > 0 ? imagesArr : ['https://images.unsplash.com/photo-1611532736597-de2d4265fba3?auto=format&fit=crop&q=80&w=600'],
        category: p.category || 'glass',
        price: Number(p.price) || 640,
        is_best_seller: Boolean(p.is_best_seller),
        show_on_home: p.show_on_home !== false,
      });
    }
  });

  // 4. Exclude deleted products
  let deletedIds = new Set();
  try {
    deletedIds = new Set(JSON.parse(localStorage.getItem('deleted_product_ids') || '[]'));
  } catch (e) {}

  const finalProducts = Array.from(map.values()).filter(
    p => !deletedIds.has(p.id) &&
         !p.name?.toLowerCase().includes('emrpemmrpg') &&
         Number(p.price) !== 200 &&
         Number(p.original_price) !== 5000
  );

  return finalProducts;
}
