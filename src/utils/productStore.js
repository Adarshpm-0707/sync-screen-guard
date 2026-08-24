import { supabase } from '../supabaseClient';

export const DEFAULT_PRODUCTS = [];

export async function fetchStoreProducts() {
  // Clean up any test product like EMRPEMMRPG from local storage
  try {
    const localArr = JSON.parse(localStorage.getItem('local_added_products') || '[]');
    const cleaned = localArr.filter(
      p => p && !p.name?.toLowerCase().includes('emrpemmrpg') && Number(p.price) !== 200 && Number(p.original_price) !== 5000
    );
    if (cleaned.length !== localArr.length) {
      localStorage.setItem('local_added_products', JSON.stringify(cleaned));
    }
  } catch (e) {}

  // 1. Fetch directly from Supabase
  let dbProducts = [];
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data) {
      dbProducts = data;
    }
  } catch (e) {
    console.warn('Supabase fetch error:', e);
  }

  // 3. Get local added products (from admin offline/fallback adding)
  let localAdded = [];
  try {
    localAdded = JSON.parse(localStorage.getItem('local_added_products') || '[]');
  } catch (e) {
    localAdded = [];
  }

  // Combine: localAdded takes priority over dbProducts (handles offline edits)
  const combined = [
    ...localAdded,
    ...dbProducts,
  ];

  // 4. Deduplicate by product ID
  const map = new Map();
  combined.forEach(p => {
    if (p && p.id && !map.has(p.id)) {
      // Normalize images format if string/array
      const imagesArr = Array.isArray(p.images) ? p.images : (p.images ? [p.images] : []);
      map.set(p.id, {
        ...p,
        images: imagesArr.length > 0 ? imagesArr : [],
        category: p.category || 'glass',
        price: Number(p.price) || 640,
        is_best_seller: Boolean(p.is_best_seller),
        show_on_home: p.show_on_home !== false,
      });
    }
  });

  // 5. Exclude deleted products and EMRPEMMRPG / 200 rs product
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
  // Return only admin-added products; empty array if none exist yet
  return finalProducts;
}
