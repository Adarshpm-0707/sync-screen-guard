import { useState, useEffect } from 'react';
import { fetchStoreSettings } from '../utils/settingsStore';

export default function useStoreSettings() {
  const [settings, setSettings] = useState(() => {
    try {
      const cached = localStorage.getItem('sync_store_settings');
      if (cached) return JSON.parse(cached);
    } catch (e) {}
    return { cod_fee: 0, cod_enabled: true, razorpay_key_id: '' };
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    fetchStoreSettings().then((data) => {
      if (isMounted && data) {
        setSettings(data);
        setLoading(false);
      }
    });

    const handleSettingsUpdated = (event) => {
      if (event.detail) {
        setSettings(event.detail);
      }
    };

    const handleStorageChange = (e) => {
      if (e.key === 'sync_store_settings' && e.newValue) {
        try {
          setSettings(JSON.parse(e.newValue));
        } catch (err) {}
      }
    };

    window.addEventListener('sync_settings_updated', handleSettingsUpdated);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      isMounted = false;
      window.removeEventListener('sync_settings_updated', handleSettingsUpdated);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return { settings, loading };
}
