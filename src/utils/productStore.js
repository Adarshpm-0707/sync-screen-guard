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
let _inFlightProductsPromise = null;
const _singleProductCache = new Map();
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
 * Selects only required listing fields and limits results to minimize egress.
 * Deduplicates in-flight requests across concurrent component mounts.
 */
export function fetchStoreProducts({ forceRefresh = false, limit = 50 } = {}) {
  // Hydrate memory cache from localStorage if needed
  if (!_memoryProductsCache) {
    getInstantProducts();
  }

  const now = Date.now();
  if (
    !forceRefresh &&
    _memoryProductsCache &&
    Array.isArray(_memoryProductsCache) &&
    _memoryProductsCache.length > 0 &&
    now - _cacheTimestamp < CACHE_TTL_MS
  ) {
    return Promise.resolve(_memoryProductsCache);
  }

  // Deduplicate in-flight requests across concurrent component mounts
  if (!forceRefresh && _inFlightProductsPromise) {
    return _inFlightProductsPromise;
  }

  _inFlightProductsPromise = (async () => {
    let deletedIds = new Set();
    try {
      deletedIds = new Set(JSON.parse(localStorage.getItem('deleted_product_ids') || '[]'));
    } catch (e) {}

    // 1. Fetch listing columns from Supabase products table
    let dbProducts = [];
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id,name,price,original_price,purchasing_price,images,category,description,is_best_seller,show_on_home,stock,created_at')
        .order('created_at', { ascending: false })
        .limit(limit);

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
          purchasing_price: (p.purchasing_price !== null && p.purchasing_price !== undefined && p.purchasing_price !== '') ? Number(p.purchasing_price) : null,
          stock: typeof p.stock === 'number' ? p.stock : (Number(p.stock) || 0),
          description: (p.description !== null && p.description !== undefined) ? p.description : '',
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
      // Sanitize to prevent oversized base64 images from clogging localStorage
      const safeCache = finalProducts.map(p => ({
        ...p,
        images: Array.isArray(p.images)
          ? p.images.map(img => (typeof img === 'string' && img.length > 30000 ? img.slice(0, 100) : img))
          : p.images
      }));
      localStorage.setItem('sync_store_products_cache', JSON.stringify(safeCache));
      localStorage.setItem('sync_store_products_cache_ts', String(_cacheTimestamp));
    } catch (e) {
      try {
        localStorage.removeItem('sync_store_products_cache');
      } catch (err) {}
    }

    return finalProducts;
  })().finally(() => {
    _inFlightProductsPromise = null;
  });

  return _inFlightProductsPromise;
}

/**
 * Fetches full details for a single product on-demand (PDP view).
 * Caches individual products to avoid re-fetching on repeat views.
 */
export async function fetchProductById(productId) {
  if (!productId) return null;

  // Check single product memory cache
  const cached = _singleProductCache.get(productId);
  if (cached && Date.now() - cached.ts < CACHE_TTL_MS) {
    return cached.data;
  }

  // Check if available in local added products
  try {
    const localArr = JSON.parse(localStorage.getItem('local_added_products') || '[]');
    const localFound = localArr.find(p => p && p.id === productId);
    if (localFound && localFound.specifications) {
      _singleProductCache.set(productId, { data: localFound, ts: Date.now() });
      return localFound;
    }
  } catch (e) {}

  // Fetch full details strictly for this one product
  try {
    const { data, error } = await supabase
      .from('products')
      .select('id,name,price,original_price,purchasing_price,images,category,description,specifications,installation_guide,box_contents,is_best_seller,show_on_home,stock,created_at')
      .eq('id', productId)
      .maybeSingle();

    if (!error && data) {
      const imagesArr = Array.isArray(data.images) ? data.images : (data.images ? [data.images] : []);
      const normalized = {
        ...data,
        images: imagesArr.length > 0 ? imagesArr : ['https://images.unsplash.com/photo-1611532736597-de2d4265fba3?auto=format&fit=crop&q=80&w=600'],
        category: data.category || 'glass',
        price: Number(data.price) || 640,
        original_price: data.original_price ? Number(data.original_price) : Math.round((Number(data.price) || 640) * 1.8),
        purchasing_price: (data.purchasing_price !== null && data.purchasing_price !== undefined && data.purchasing_price !== '') ? Number(data.purchasing_price) : null,
        stock: typeof data.stock === 'number' ? data.stock : (Number(data.stock) || 0),
        description: (data.description !== null && data.description !== undefined) ? data.description : '',
        specifications: data.specifications || DEFAULT_SPECIFICATIONS,
        installation_guide: data.installation_guide || DEFAULT_INSTALLATION_GUIDE,
        box_contents: data.box_contents || DEFAULT_BOX_CONTENTS,
        is_best_seller: Boolean(data.is_best_seller),
        show_on_home: data.show_on_home !== false,
      };
      _singleProductCache.set(productId, { data: normalized, ts: Date.now() });
      return normalized;
    }
  } catch (e) {
    console.warn('Supabase fetch single product error:', e);
  }

  return null;
}

/**
 * Permanently deletes all products from both Supabase database and local admin storage.
 */
export async function clearAllStoreProducts() {
  _memoryProductsCache = [];
  _cacheTimestamp = 0;
  _singleProductCache.clear();

  try {
    localStorage.removeItem('local_added_products');
    localStorage.removeItem('sync_store_products_cache');
    localStorage.removeItem('sync_store_products_cache_ts');
    localStorage.removeItem('deleted_product_ids');
  } catch (e) {}

  let dbError = null;
  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
    if (error) dbError = error;
  } catch (e) {
    dbError = e;
  }

  window.dispatchEvent(new Event('products_updated'));
  return { success: !dbError, error: dbError };
}

// Automatically invalidate in-memory and local cache on products_updated event
if (typeof window !== 'undefined') {
  window.addEventListener('products_updated', () => {
    _memoryProductsCache = null;
    _cacheTimestamp = 0;
    _singleProductCache.clear();
    try {
      localStorage.removeItem('sync_store_products_cache');
      localStorage.removeItem('sync_store_products_cache_ts');
    } catch (e) {}
  });
}
