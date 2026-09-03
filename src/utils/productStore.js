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

// In-memory cache for instant 0ms retrieval
let _memoryProductsCache = null;
let _cacheTimestamp = 0;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

// Synchronously get cached products for instant React initial state (0ms latency)
export function getInstantProducts() {
  if (_memoryProductsCache && Array.isArray(_memoryProductsCache)) {
    return _memoryProductsCache;
  }
  try {
    const cached = localStorage.getItem('sync_store_products_cache');
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed)) {
        // Filter out deleted product IDs
        const deletedIds = new Set(JSON.parse(localStorage.getItem('deleted_product_ids') || '[]'));
        const valid = parsed.filter(p => p && p.id && !deletedIds.has(p.id));
        _memoryProductsCache = valid;
        // Restore the cache timestamp so TTL still applies after a page refresh
        const ts = localStorage.getItem('sync_store_products_cache_ts');
        if (ts) _cacheTimestamp = Number(ts) || 0;
        return valid;
      }
    }
  } catch (e) {}

  return [];
}

/**
 * Fetches products from Supabase and local admin store.
 * Strictly returns ONLY existing admin-added products.
 * Excludes any deleted products.
 */
export async function fetchStoreProducts({ forceRefresh = false } = {}) {
  // Return memory cache immediately if it's still fresh (within TTL)
  const now = Date.now();
  if (
    !forceRefresh &&
    _memoryProductsCache &&
    Array.isArray(_memoryProductsCache) &&
    _memoryProductsCache.length > 0 &&
    now - _cacheTimestamp < CACHE_TTL_MS
  ) {
    return _memoryProductsCache;
  }

  let deletedIds = new Set();
  try {
    deletedIds = new Set(JSON.parse(localStorage.getItem('deleted_product_ids') || '[]'));
  } catch (e) {}

  // 1. Fetch directly from Supabase products table (select only needed columns for speed)
  let dbProducts = [];
  try {
    const { data, error } = await supabase
      .from('products')
      .select('id,name,price,original_price,purchasing_price,images,category,description,specifications,installation_guide,box_contents,is_best_seller,show_on_home,stock,created_at')
      .order('created_at', { ascending: false });

    if (!error && Array.isArray(data)) {
      dbProducts = data;
    }
  } catch (e) {
    console.warn('Supabase fetch products error:', e);
  }

  // 2. Get local admin-added products (from Admin Panel additions)
  let localAdded = [];
  try {
    const localArr = JSON.parse(localStorage.getItem('local_added_products') || '[]');
    if (Array.isArray(localArr)) {
      // Remove any previously deleted items from local_added_products
      localAdded = localArr.filter(p => p && p.id && !deletedIds.has(p.id));
    }
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
    if (p && p.id && !deletedIds.has(p.id) && !map.has(p.id)) {
      const imagesArr = Array.isArray(p.images) ? p.images : (p.images ? [p.images] : []);
      map.set(p.id, {
        ...p,
        images: imagesArr.length > 0 ? imagesArr : ['https://images.unsplash.com/photo-1611532736597-de2d4265fba3?auto=format&fit=crop&q=80&w=600'],
        category: p.category || 'glass',
        price: Number(p.price) || 640,
        original_price: p.original_price ? Number(p.original_price) : Math.round((Number(p.price) || 640) * 1.8),
        purchasing_price: p.purchasing_price ? Number(p.purchasing_price) : null,
        stock: typeof p.stock === 'number' ? p.stock : (Number(p.stock) || 0),
        description: p.description || 'Premium quality Sync electronics and accessories — built for performance, durability, and your everyday digital lifestyle.',
        specifications: p.specifications || DEFAULT_SPECIFICATIONS,
        installation_guide: p.installation_guide || DEFAULT_INSTALLATION_GUIDE,
        box_contents: p.box_contents || DEFAULT_BOX_CONTENTS,
        is_best_seller: Boolean(p.is_best_seller),
        show_on_home: p.show_on_home !== false,
      });
    }
  });

  const finalProducts = Array.from(map.values()).filter(p => !deletedIds.has(p.id));

  // Update in-memory & local cache for instant future loads
  _memoryProductsCache = finalProducts;
  _cacheTimestamp = Date.now();
  try {
    localStorage.setItem('sync_store_products_cache', JSON.stringify(finalProducts));
    localStorage.setItem('sync_store_products_cache_ts', String(_cacheTimestamp));
  } catch (e) {}

  return finalProducts;
}

// Automatically trigger early prefetch on module load
try {
  fetchStoreProducts().catch(() => {});
} catch (e) {}
