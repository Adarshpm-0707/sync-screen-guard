/**
 * storageCleaner.js
 * Utility to inspect, calculate, and safely clean bloated localStorage entries.
 * Prevents "QuotaExceededError" and restores browser storage to 0% bloat.
 */

// Keys that should NEVER be deleted during cleanup (auth & critical credentials)
const PROTECTED_KEYS = new Set([
  'admin_token',
  'admin_user',
  'admin_roles',
  'local_customer_user',
  'sync_cart',
  'sync_cat_migration_v2'
]);

/**
 * Calculate total localStorage usage in bytes and formatted string.
 */
export function getStorageUsage() {
  let totalBytes = 0;
  const items = [];

  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;
      const val = localStorage.getItem(key) || '';
      const sizeBytes = (key.length + val.length) * 2; // UTF-16 characters
      totalBytes += sizeBytes;
      items.push({ key, sizeBytes, isProtected: PROTECTED_KEYS.has(key) });
    }
  } catch (e) {
    console.warn('Error reading localStorage usage:', e);
  }

  // Sort descending by size
  items.sort((a, b) => b.sizeBytes - a.sizeBytes);

  const approxQuota = 5 * 1024 * 1024; // 5MB standard browser quota
  const percentUsed = Math.min(100, Math.round((totalBytes / approxQuota) * 100));

  return {
    totalBytes,
    percentUsed,
    items,
    formattedTotal: formatSize(totalBytes),
  };
}

/**
 * Format bytes to human-readable string.
 */
function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/**
 * Automatically purges bloated caches and non-essential oversized keys.
 * Preserves authentication and critical settings.
 * @returns {{ freedBytes: number, removedKeys: string[] }}
 */
export function cleanBloatedStorage({ forceAllCaches = false } = {}) {
  const removedKeys = [];
  let freedBytes = 0;

  try {
    const keysToRemove = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key || PROTECTED_KEYS.has(key)) continue;

      const val = localStorage.getItem(key) || '';
      const sizeBytes = (key.length + val.length) * 2;

      // Criteria for removal:
      // 1. All legacy admin-added products and product caches
      // 2. Any key greater than 250 KB (bloated cache/payload)
      // 3. Any known cache key when forceAllCaches is true
      const isProductStoreKey = key === 'local_added_products' || key === 'sync_store_products_cache' || key === 'sync_store_products_cache_ts' || key === 'deleted_product_ids';
      const isKnownCache = key.includes('_cache') || isProductStoreKey;
      const isOversized = sizeBytes > 250 * 1024;

      if (isProductStoreKey || isOversized || (forceAllCaches && isKnownCache)) {
        keysToRemove.push({ key, sizeBytes });
      }
    }

    keysToRemove.forEach(({ key, sizeBytes }) => {
      localStorage.removeItem(key);
      removedKeys.push(key);
      freedBytes += sizeBytes;
    });

    if (removedKeys.length > 0) {
      console.info(`[Storage Cleaner] Cleaned ${removedKeys.length} items, freed ${formatSize(freedBytes)}.`);
      window.dispatchEvent(new Event('products_updated'));
      window.dispatchEvent(new Event('categories_updated'));
    }
  } catch (e) {
    console.error('Error cleaning storage:', e);
  }

  return { freedBytes, removedKeys, formattedFreed: formatSize(freedBytes) };
}
