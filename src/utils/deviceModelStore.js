import { supabase } from '../supabaseClient';

export const DEFAULT_INITIAL_MODELS = [
  // iPhone
  { id: 'dev-ip-16pm', brand: 'iPhone', model_name: 'iPhone 16 Pro Max' },
  { id: 'dev-ip-16p', brand: 'iPhone', model_name: 'iPhone 16 Pro' },
  { id: 'dev-ip-16', brand: 'iPhone', model_name: 'iPhone 16' },
  { id: 'dev-ip-15pm', brand: 'iPhone', model_name: 'iPhone 15 Pro Max' },
  { id: 'dev-ip-15p', brand: 'iPhone', model_name: 'iPhone 15 Pro' },
  { id: 'dev-ip-15', brand: 'iPhone', model_name: 'iPhone 15' },
  { id: 'dev-ip-14pm', brand: 'iPhone', model_name: 'iPhone 14 Pro Max' },
  { id: 'dev-ip-14', brand: 'iPhone', model_name: 'iPhone 14' },
  { id: 'dev-ip-13', brand: 'iPhone', model_name: 'iPhone 13' },
  
  // Samsung
  { id: 'dev-sam-s24u', brand: 'Samsung', model_name: 'Galaxy S24 Ultra' },
  { id: 'dev-sam-s24p', brand: 'Samsung', model_name: 'Galaxy S24 Plus' },
  { id: 'dev-sam-s24', brand: 'Samsung', model_name: 'Galaxy S24' },
  { id: 'dev-sam-s23u', brand: 'Samsung', model_name: 'Galaxy S23 Ultra' },
  { id: 'dev-sam-s23', brand: 'Samsung', model_name: 'Galaxy S23' },
  { id: 'dev-sam-a55', brand: 'Samsung', model_name: 'Galaxy A55 5G' },

  // OnePlus
  { id: 'dev-op-12', brand: 'OnePlus', model_name: 'OnePlus 12' },
  { id: 'dev-op-12r', brand: 'OnePlus', model_name: 'OnePlus 12R' },
  { id: 'dev-op-11', brand: 'OnePlus', model_name: 'OnePlus 11' },
  { id: 'dev-op-nord4', brand: 'OnePlus', model_name: 'OnePlus Nord 4' },

  // Google Pixel
  { id: 'dev-pix-9pro', brand: 'Google Pixel', model_name: 'Pixel 9 Pro XL' },
  { id: 'dev-pix-9', brand: 'Google Pixel', model_name: 'Pixel 9' },
  { id: 'dev-pix-8pro', brand: 'Google Pixel', model_name: 'Pixel 8 Pro' },
  { id: 'dev-pix-8', brand: 'Google Pixel', model_name: 'Pixel 8' },

  // Vivo
  { id: 'dev-vivo-x100', brand: 'Vivo', model_name: 'Vivo X100 Pro' },
  { id: 'dev-vivo-v30', brand: 'Vivo', model_name: 'Vivo V30 Pro' },

  // Realme
  { id: 'dev-realme-12', brand: 'Realme', model_name: 'Realme 12 Pro Plus' },
  { id: 'dev-realme-gt', brand: 'Realme', model_name: 'Realme GT 6' },
];

/**
 * Group array of models into { Brand: [model1, model2, ...] }
 */
export function groupModelsByBrand(modelsList = []) {
  const map = {};
  modelsList.forEach(item => {
    if (!item || !item.brand || !item.model_name) return;
    const b = item.brand.trim();
    const m = item.model_name.trim();
    if (!map[b]) {
      map[b] = [];
    }
    if (!map[b].includes(m)) {
      map[b].push(m);
    }
  });
  return map;
}

/**
 * Synchronous instant retrieval
 */
export function getInstantDeviceModels() {
  try {
    const cached = localStorage.getItem('sync_device_models_cache');
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {}

  return DEFAULT_INITIAL_MODELS;
}

/**
 * Synchronous instant grouped models
 */
export function getInstantGroupedModels() {
  return groupModelsByBrand(getInstantDeviceModels());
}

/**
 * Fetch device models from Supabase with localStorage caching
 */
export async function fetchDeviceModels() {
  let dbModels = [];
  try {
    const { data, error } = await supabase
      .from('device_models')
      .select('*')
      .order('brand', { ascending: true });

    if (!error && Array.isArray(data)) {
      dbModels = data;
    }
  } catch (err) {
    console.warn('Supabase device models fetch error:', err);
  }

  // If database has models configured, use them
  if (dbModels.length > 0) {
    try {
      localStorage.setItem('sync_device_models_cache', JSON.stringify(dbModels));
    } catch (e) {}
    return dbModels;
  }

  // Check if admin has customized models in localStorage
  try {
    const local = localStorage.getItem('sync_device_models_cache');
    if (local) {
      const parsed = JSON.parse(local);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {}

  // Initial seed to database & localStorage
  try {
    localStorage.setItem('sync_device_models_cache', JSON.stringify(DEFAULT_INITIAL_MODELS));
    // Seed initial to DB in background
    supabase.from('device_models').insert(
      DEFAULT_INITIAL_MODELS.map(m => ({
        brand: m.brand,
        model_name: m.model_name
      }))
    ).then(() => {}).catch(() => {});
  } catch (e) {}

  return DEFAULT_INITIAL_MODELS;
}

/**
 * Fetch grouped models by brand
 */
export async function fetchGroupedModels() {
  const list = await fetchDeviceModels();
  return groupModelsByBrand(list);
}

/**
 * Add a new brand model
 */
export async function addDeviceModel(brand, modelName) {
  if (!brand?.trim() || !modelName?.trim()) {
    throw new Error('Brand and model name are required');
  }

  const cleanBrand = brand.trim();
  const cleanModel = modelName.trim();

  const newObj = {
    id: `dev_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    brand: cleanBrand,
    model_name: cleanModel,
    created_at: new Date().toISOString()
  };

  // 1. Save to Supabase
  try {
    const { data, error } = await supabase
      .from('device_models')
      .insert({
        brand: cleanBrand,
        model_name: cleanModel
      })
      .select()
      .single();

    if (!error && data) {
      newObj.id = data.id;
    }
  } catch (err) {
    console.warn('Supabase device model insert warning:', err);
  }

  // 2. Update localStorage cache
  try {
    const current = getInstantDeviceModels();
    const exists = current.some(
      m => m.brand?.toLowerCase() === cleanBrand.toLowerCase() && m.model_name?.toLowerCase() === cleanModel.toLowerCase()
    );
    if (!exists) {
      current.push(newObj);
      localStorage.setItem('sync_device_models_cache', JSON.stringify(current));
    }
  } catch (e) {}

  window.dispatchEvent(new Event('device_models_updated'));
  return newObj;
}

/**
 * Delete a model by ID
 */
export async function deleteDeviceModel(id, brand, modelName) {
  // 1. Delete from Supabase
  try {
    if (id && !String(id).startsWith('dev_')) {
      await supabase.from('device_models').delete().eq('id', id);
    } else if (brand && modelName) {
      await supabase
        .from('device_models')
        .delete()
        .eq('brand', brand)
        .eq('model_name', modelName);
    }
  } catch (err) {
    console.warn('Supabase device model delete warning:', err);
  }

  // 2. Remove from local storage cache
  try {
    const current = getInstantDeviceModels();
    const filtered = current.filter(m => {
      if (id && String(m.id) === String(id)) return false;
      if (brand && modelName && m.brand === brand && m.model_name === modelName) return false;
      return true;
    });
    localStorage.setItem('sync_device_models_cache', JSON.stringify(filtered));
  } catch (e) {}

  window.dispatchEvent(new Event('device_models_updated'));
}

/**
 * Delete all models under a brand
 */
export async function deleteBrand(brand) {
  if (!brand) return;

  // 1. Delete from Supabase
  try {
    await supabase.from('device_models').delete().eq('brand', brand);
  } catch (err) {
    console.warn('Supabase delete brand warning:', err);
  }

  // 2. Remove from local storage
  try {
    const current = getInstantDeviceModels();
    const filtered = current.filter(m => m.brand?.toLowerCase() !== brand.toLowerCase());
    localStorage.setItem('sync_device_models_cache', JSON.stringify(filtered));
  } catch (e) {}

  window.dispatchEvent(new Event('device_models_updated'));
}
