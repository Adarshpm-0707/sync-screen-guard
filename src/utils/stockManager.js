import { supabase } from '../supabaseClient';

/**
 * Decreases stock for products in an order when a customer purchases.
 * @param {Array<{ id?: string, product_id?: string, quantity: number }>} items 
 */
export async function decreaseStockForOrder(items) {
  if (!Array.isArray(items) || items.length === 0) return;

  for (const item of items) {
    const prodId = item.id || item.product_id;
    if (!prodId) continue;
    const qty = Number(item.quantity) || 1;

    // 1. Fetch & update stock in Supabase
    try {
      const { data: prod } = await supabase
        .from('products')
        .select('id, stock')
        .eq('id', prodId)
        .maybeSingle();

      if (prod) {
        const currentStock = Number(prod.stock) || 0;
        const newStock = Math.max(0, currentStock - qty);
        await supabase
          .from('products')
          .update({ stock: newStock })
          .eq('id', prodId);
      }
    } catch (e) {
      console.warn('Supabase stock decrease error:', e);
    }

    // 2. Update stock in local storage added products fallback
    try {
      const localProducts = JSON.parse(localStorage.getItem('local_added_products') || '[]');
      const idx = localProducts.findIndex(p => p && p.id === prodId);
      if (idx >= 0) {
        const currentStock = Number(localProducts[idx].stock) || 0;
        localProducts[idx].stock = Math.max(0, currentStock - qty);
        localStorage.setItem('local_added_products', JSON.stringify(localProducts));
      }
    } catch (e) {
      console.warn('Local stock decrease error:', e);
    }
  }

  // Trigger app-wide event so Admin products table and catalog refresh
  window.dispatchEvent(new Event('products_updated'));
}

/**
 * Restores / increases stock for products when an order is cancelled.
 * @param {Array<{ id?: string, product_id?: string, quantity: number }>} items 
 */
export async function restoreStockForCancelledOrder(items) {
  if (!Array.isArray(items) || items.length === 0) return;

  for (const item of items) {
    const prodId = item.id || item.product_id;
    if (!prodId) continue;
    const qty = Number(item.quantity) || 1;

    // 1. Fetch & update stock in Supabase
    try {
      const { data: prod } = await supabase
        .from('products')
        .select('id, stock')
        .eq('id', prodId)
        .maybeSingle();

      if (prod) {
        const currentStock = Number(prod.stock) || 0;
        const newStock = currentStock + qty;
        await supabase
          .from('products')
          .update({ stock: newStock })
          .eq('id', prodId);
      }
    } catch (e) {
      console.warn('Supabase stock restore error:', e);
    }

    // 2. Update stock in local storage added products fallback
    try {
      const localProducts = JSON.parse(localStorage.getItem('local_added_products') || '[]');
      const idx = localProducts.findIndex(p => p && p.id === prodId);
      if (idx >= 0) {
        const currentStock = Number(localProducts[idx].stock) || 0;
        localProducts[idx].stock = currentStock + qty;
        localStorage.setItem('local_added_products', JSON.stringify(localProducts));
      }
    } catch (e) {
      console.warn('Local stock restore error:', e);
    }
  }

  // Trigger app-wide event so Admin products table and catalog refresh
  window.dispatchEvent(new Event('products_updated'));
}
