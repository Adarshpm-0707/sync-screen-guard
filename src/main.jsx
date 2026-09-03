import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/globals.css'
import App from './App.jsx'
import { initClientSecurity } from './utils/security.js'

// Initialize client-side security protections
initClientSecurity();

// ── One-time migration: remove old screen guard default categories from localStorage ──
// This runs once to clean up stale seeded data from the previous screen guard brand.
(function migrateOldCategories() {
  const MIGRATION_KEY = 'sync_cat_migration_v2';
  if (localStorage.getItem(MIGRATION_KEY)) return; // already done

  const OLD_DEFAULT_IDS = new Set(['glass', 'privacy', 'sparkle', 'camera', 'watch']);

  try {
    const stored = localStorage.getItem('admin_categories');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        // Keep only categories that are NOT the old screen guard defaults
        const cleaned = parsed.filter(c => !OLD_DEFAULT_IDS.has(c.id));
        localStorage.setItem('admin_categories', JSON.stringify(cleaned));
      }
    }
  } catch (e) {
    // ignore
  }

  localStorage.setItem(MIGRATION_KEY, '1');
  // Notify any listeners that categories changed
  window.dispatchEvent(new Event('categories_updated'));
})();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
