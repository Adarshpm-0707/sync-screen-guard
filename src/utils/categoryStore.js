import { supabase } from '../supabaseClient';

export const DEFAULT_CATEGORIES = [
  { id: 'electronics', name: 'Electronics', description: 'Smartphones, tablets, laptops and smart devices' },
  { id: 'accessories', name: 'Accessories', description: 'Premium mobile and device accessories' },
  { id: 'gadgets', name: 'Gadgets', description: 'Innovative smart gadgets and tech tools' },
  { id: 'audio', name: 'Audio', description: 'Earphones, headphones and speakers' },
  { id: 'charging', name: 'Charging & Cables', description: 'Fast chargers, cables and power banks' },
];

// In-memory cache for instant 0ms retrieval
let _memoryCategoriesCache = null;
let _categoriesCacheTimestamp = 0;
const CATEGORIES_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

// Synchronously return cached categories — no network, no wait
export function getInstantCategories() {
  if (_memoryCategoriesCache && Array.isArray(_memoryCategoriesCache)) {
    return _memoryCategoriesCache;
  }
  try {
    const cached = localStorage.getItem('sync_store_categories_cache');
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) {
        _memoryCategoriesCache = parsed;
        // Restore the cache timestamp so TTL persists across refreshes
        const ts = localStorage.getItem('sync_store_categories_cache_ts');
        if (ts) _categoriesCacheTimestamp = Number(ts) || 0;
        return parsed;
      }
    }
  } catch (e) {}
  return [];
}

export async function fetchCategories({ forceRefresh = false } = {}) {
  // Return memory cache immediately if still fresh
  const now = Date.now();
  if (
    !forceRefresh &&
    _memoryCategoriesCache &&
    Array.isArray(_memoryCategoriesCache) &&
    _memoryCategoriesCache.length > 0 &&
    now - _categoriesCacheTimestamp < CATEGORIES_CACHE_TTL_MS
  ) {
    return _memoryCategoriesCache;
  }

  let dbCategories = [];
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('id,name,description,created_at')
      .order('created_at', { ascending: true });

    if (!error && Array.isArray(data) && data.length > 0) {
      dbCategories = data;
    }
  } catch (e) {
    console.warn('Supabase categories fetch error:', e);
  }

  // If Supabase has categories configured, use them
  if (dbCategories.length > 0) {
    _memoryCategoriesCache = dbCategories;
    _categoriesCacheTimestamp = Date.now();
    try {
      localStorage.setItem('sync_store_categories_cache', JSON.stringify(dbCategories));
      localStorage.setItem('sync_store_categories_cache_ts', String(_categoriesCacheTimestamp));
    } catch (e) {}
    return dbCategories;
  }

  // Check localStorage for admin managed categories
  let localCategories = null;
  try {
    const stored = localStorage.getItem('admin_categories');
    if (stored !== null) {
      localCategories = JSON.parse(stored);
    }
  } catch (e) {
    localCategories = null;
  }

  if (localCategories !== null && Array.isArray(localCategories)) {
    _memoryCategoriesCache = localCategories;
    try { localStorage.setItem('sync_store_categories_cache', JSON.stringify(localCategories)); } catch (e) {}
    return localCategories;
  }

  // No categories found — return empty so old defaults never re-seed
  return [];
}

// Automatically prefetch categories on module load
try {
  fetchCategories().catch(() => {});
} catch (e) {}

const DEFAULT_CATEGORY_IDS = new Set(DEFAULT_CATEGORIES.map(c => c.id));

/**
 * Returns ONLY categories that an admin has explicitly created
 * (Supabase or localStorage), excluding any system default categories.
 * Used by the Footer so only real admin-added categories appear (max 4).
 */
export async function fetchAdminCategories() {
  // 1. Try Supabase first — return ALL categories (admin-created)
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('created_at', { ascending: true });

    if (!error && Array.isArray(data) && data.length > 0) {
      return data;
    }
  } catch (e) {
    console.warn('Supabase categories fetch error:', e);
  }

  // 2. Fall back to localStorage — return all stored categories
  try {
    const stored = localStorage.getItem('admin_categories');
    if (stored !== null) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (e) {}

  // 3. No categories yet
  return [];
}

export async function addCategory(categoryData) {
  const cleanId = (categoryData.id || categoryData.name || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  if (!cleanId) {
    throw new Error('Invalid category name or ID');
  }

  const categoryObj = {
    id: cleanId,
    name: categoryData.name.trim(),
    description: categoryData.description ? categoryData.description.trim() : '',
    created_at: new Date().toISOString()
  };

  // Try saving to Supabase
  try {
    await supabase.from('categories').upsert(categoryObj);
  } catch (e) {
    console.warn('Supabase category save error:', e);
  }

  // Save to local storage
  let localCategories = [];
  try {
    const stored = localStorage.getItem('admin_categories');
    localCategories = stored ? JSON.parse(stored) : [...DEFAULT_CATEGORIES];
  } catch (e) {
    localCategories = [...DEFAULT_CATEGORIES];
  }

  const existingIdx = localCategories.findIndex(c => c.id === cleanId);
  if (existingIdx >= 0) {
    localCategories[existingIdx] = categoryObj;
  } else {
    localCategories.push(categoryObj);
  }

  localStorage.setItem('admin_categories', JSON.stringify(localCategories));
  // Update caches so next getInstantCategories() call sees the new data
  _memoryCategoriesCache = localCategories;
  try { localStorage.setItem('sync_store_categories_cache', JSON.stringify(localCategories)); } catch (e) {}
  window.dispatchEvent(new Event('categories_updated'));

  return categoryObj;
}

export async function deleteCategory(categoryId) {
  // Delete from Supabase
  try {
    await supabase.from('categories').delete().eq('id', categoryId);
  } catch (e) {
    console.warn('Supabase category delete error:', e);
  }

  // Remove from localStorage
  let localCategories = [];
  try {
    const stored = localStorage.getItem('admin_categories');
    localCategories = stored ? JSON.parse(stored) : [...DEFAULT_CATEGORIES];
  } catch (e) {
    localCategories = [...DEFAULT_CATEGORIES];
  }

  const filtered = localCategories.filter(c => c.id !== categoryId);
  localStorage.setItem('admin_categories', JSON.stringify(filtered));
  // Update caches
  _memoryCategoriesCache = filtered;
  try { localStorage.setItem('sync_store_categories_cache', JSON.stringify(filtered)); } catch (e) {}

  window.dispatchEvent(new Event('categories_updated'));
}
