import { supabase } from '../supabaseClient';

export const DEFAULT_SPECIFICATIONS = `Material: High-Aluminosilicate 9H Double Tempered Glass
Thickness: 0.33mm ultra-slim responsive glass
Coating: Double electroplated oleophobic oil-repellent layer
Clarity: 99.9% optical transparency, zero color distortion
Adhesive: Optical grade nano-silicone (bubble-free auto dispersion)`;

export const DEFAULT_INSTALLATION_GUIDE = `1. Wipe screen with the included wet alcohol wipe and microfiber cloth.
2. Place the Sync auto-alignment box directly over your phone.
3. Pull the arrowed dust-extraction tab until removed.
4. Slide finger across center arrow for 5 seconds and lift off box!`;

export const DEFAULT_BOX_CONTENTS = `• 1x 9H Tempered Glass inside Auto-Alignment Box
• 1x Wet Alcohol Prep Wipe
• 1x Microfiber Polishing Cloth
• 1x Dust Absorber Sticker & Guide Tabs
• 1x Squeegee Card`;

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
    description: 'Flagship 9H tempered glass featuring revolutionary auto-alignment box applicator. Dust-free, bubble-free 10-second installation with oleophobic anti-fingerprint coating.',
    specifications: DEFAULT_SPECIFICATIONS,
    installation_guide: DEFAULT_INSTALLATION_GUIDE,
    box_contents: DEFAULT_BOX_CONTENTS
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
    description: '28-degree narrow-angle anti-spy privacy screen protector. Prevents side viewing while retaining HD visual clarity and touch response.',
    specifications: `Material: 28° Anti-Spy Polarized 9H Tempered Glass\nThickness: 0.33mm responsive privacy glass\nCoating: Micro-louver optical privacy filter & oleophobic coating\nClarity: HD frontal clarity, blacked out from 28-degree side angles\nAdhesive: Bubble-free instant auto-align dispersion silicone`,
    installation_guide: DEFAULT_INSTALLATION_GUIDE,
    box_contents: DEFAULT_BOX_CONTENTS
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
    description: 'Curved edge 9H glass engineered specifically for Samsung Galaxy flagships. Includes 10-second alignment applicator.',
    specifications: `Material: 3D Curved Edge 9H Aluminosilicate Glass\nThickness: 0.28mm ultrasonic fingerprint compatible\nCoating: Plasma vapor oleophobic coating\nClarity: 99.9% Dynamic AMOLED color passthrough\nAdhesive: Ultrasonic sensor optimized optical silicone`,
    installation_guide: DEFAULT_INSTALLATION_GUIDE,
    box_contents: DEFAULT_BOX_CONTENTS
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
    description: 'Smooth silk-finish anti-glare glass designed for gaming and outdoor usage. Eliminates reflections and smudges effortlessly.',
    specifications: `Material: Silk Etched Matte Anti-Glare 9H Glass\nThickness: 0.33mm ultra-glide gaming glass\nCoating: Micro-textured reflection-canceling matte armor\nClarity: Diffused ambient light reduction with crisp contrast\nAdhesive: Nano electrostatic bubble-free silicone`,
    installation_guide: DEFAULT_INSTALLATION_GUIDE,
    box_contents: DEFAULT_BOX_CONTENTS
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
    description: 'High-impact glass protector with electroplated oleophobic coating and custom alignment tray for OnePlus smartphones.',
    specifications: DEFAULT_SPECIFICATIONS,
    installation_guide: DEFAULT_INSTALLATION_GUIDE,
    box_contents: DEFAULT_BOX_CONTENTS
  }
];

// In-memory cache for instant 0ms retrieval
let _memoryProductsCache = null;

// Synchronously get cached products for instant React initial state
export function getInstantProducts() {
  if (_memoryProductsCache && _memoryProductsCache.length > 0) {
    return _memoryProductsCache;
  }
  try {
    const cached = localStorage.getItem('sync_store_products_cache');
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) {
        _memoryProductsCache = parsed;
        return parsed;
      }
    }
  } catch (e) {}

  // Fallback to DEFAULT_PRODUCTS for instant first-time render
  return DEFAULT_PRODUCTS;
}

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

  // Combine: localAdded takes priority over dbProducts
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
        description: p.description || 'High-precision 9H tempered glass screen guard with dust-free 10-second alignment applicator.',
        specifications: p.specifications || DEFAULT_SPECIFICATIONS,
        installation_guide: p.installation_guide || DEFAULT_INSTALLATION_GUIDE,
        box_contents: p.box_contents || DEFAULT_BOX_CONTENTS,
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

  const result = finalProducts.length > 0 ? finalProducts : DEFAULT_PRODUCTS;

  // Update in-memory & local cache for instant future loads
  _memoryProductsCache = result;
  try {
    localStorage.setItem('sync_store_products_cache', JSON.stringify(result));
  } catch (e) {}

  return result;
}
