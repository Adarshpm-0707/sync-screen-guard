import { supabase } from '../supabaseClient';

export const DEFAULT_CATEGORIES = [
  { id: 'glass', name: 'Glass Guard', description: 'Clear HD Tempered Glass Screen Guard' },
  { id: 'privacy', name: 'Privacy Guard', description: 'Anti-Spy Tinted Privacy Glass' },
  { id: 'sparkle', name: 'Sparkle / Matte', description: 'Anti-Glare Matte Finish Glass' },
  { id: 'camera', name: 'Camera Lens Protector', description: 'Multi-layer Camera Glass Protection' },
  { id: 'watch', name: 'Watch Screen Guard', description: 'Smartwatch Screen Protector' },
];

export async function fetchCategories() {
  let dbCategories = [];
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('created_at', { ascending: true });

    if (!error && Array.isArray(data) && data.length > 0) {
      dbCategories = data;
    }
  } catch (e) {
    console.warn('Supabase categories fetch error:', e);
  }

  // If Supabase has categories configured, use them
  if (dbCategories.length > 0) {
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
    return localCategories;
  }

  // Initial seed fallback (only saved once so admin can edit/delete freely)
  try {
    localStorage.setItem('admin_categories', JSON.stringify(DEFAULT_CATEGORIES));
  } catch (e) {}

  return DEFAULT_CATEGORIES;
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

  window.dispatchEvent(new Event('categories_updated'));
}
