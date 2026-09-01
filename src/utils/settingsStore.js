import { supabase } from '../supabaseClient';

const DEFAULT_SETTINGS = {
  cod_fee: 0,
  cod_enabled: true,
  razorpay_key_id: '',
};

export async function fetchStoreSettings() {
  let settings = { ...DEFAULT_SETTINGS };

  // 1. Try local storage cache
  try {
    const cached = localStorage.getItem('sync_store_settings');
    if (cached) {
      const parsed = JSON.parse(cached);
      settings = { ...settings, ...parsed };
    }
  } catch (e) {
    console.warn('Local settings parse error:', e);
  }

  // 2. Try Supabase store_settings table
  try {
    const { data: dbData, error } = await supabase
      .from('store_settings')
      .select('*')
      .limit(1)
      .maybeSingle();

    if (!error && dbData) {
      settings = {
        ...settings,
        cod_fee: dbData.cod_fee !== undefined ? Number(dbData.cod_fee) : settings.cod_fee,
        cod_enabled: dbData.cod_enabled !== undefined ? Boolean(dbData.cod_enabled) : settings.cod_enabled,
        razorpay_key_id: dbData.razorpay_key_id || settings.razorpay_key_id,
      };
      localStorage.setItem('sync_store_settings', JSON.stringify(settings));
    }
  } catch (err) {
    // Supabase table may not exist or offline, fallback safely
  }

  // 3. Try Backend API endpoint if online
  try {
    const res = await fetch('http://localhost:5000/api/settings');
    if (res.ok) {
      const apiData = await res.json();
      if (apiData) {
        settings = { ...settings, ...apiData };
        localStorage.setItem('sync_store_settings', JSON.stringify(settings));
      }
    }
  } catch (apiErr) {
    // Backend API optional
  }

  return settings;
}

export async function saveStoreSettings(newSettings) {
  const merged = {
    ...DEFAULT_SETTINGS,
    ...newSettings,
    cod_fee: Number(newSettings.cod_fee) >= 0 ? Number(newSettings.cod_fee) : 0,
    cod_enabled: Boolean(newSettings.cod_enabled),
    updated_at: new Date().toISOString(),
  };

  // 1. Save to local storage
  try {
    localStorage.setItem('sync_store_settings', JSON.stringify(merged));
  } catch (e) {}

  // 2. Dispatch custom event for real-time reactivity in open customer tabs
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('sync_settings_updated', { detail: merged }));
  }

  // 3. Save to Supabase store_settings
  try {
    await supabase.from('store_settings').upsert({
      id: 'default',
      cod_fee: merged.cod_fee,
      cod_enabled: merged.cod_enabled,
      updated_at: merged.updated_at,
    });
  } catch (err) {
    console.warn('Supabase store_settings upsert fallback:', err);
  }

  // 4. Send to Backend API
  try {
    let token = localStorage.getItem('admin_token');
    if (!token || token === 'undefined') {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        token = session?.access_token;
      } catch (_) {}
    }
    if (!token) token = 'local_admin_token';

    await fetch('http://localhost:5000/api/admin/settings', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        cod_fee: merged.cod_fee,
        cod_enabled: merged.cod_enabled,
      }),
    });
  } catch (apiErr) {
    console.warn('Backend API settings save fallback:', apiErr);
  }

  return merged;
}
