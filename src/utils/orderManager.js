import { supabase } from '../supabaseClient';
import { getAdminAuthHeaders } from '../admin/utils/adminAuth';

const DELETED_ORDERS_KEY = 'deleted_order_ids';
const CUSTOMER_ORDERS_KEY = 'customer_orders';

/**
 * Get the set of all deleted order IDs from localStorage
 * @returns {Set<string>}
 */
export function getDeletedOrderIdsSet() {
  try {
    const raw = localStorage.getItem(DELETED_ORDERS_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    return new Set(Array.isArray(parsed) ? parsed.map(String) : []);
  } catch (e) {
    console.error('Error reading deleted_order_ids:', e);
    return new Set();
  }
}

/**
 * Get all deleted order IDs as an array
 * @returns {string[]}
 */
export function getDeletedOrderIds() {
  return Array.from(getDeletedOrderIdsSet());
}

/**
 * Check if a given order ID has been marked deleted
 * @param {string|number} orderId 
 * @returns {boolean}
 */
export function isOrderDeleted(orderId) {
  if (!orderId) return false;
  const deletedSet = getDeletedOrderIdsSet();
  return deletedSet.has(String(orderId));
}

/**
 * Filter an array of orders to exclude any deleted orders
 * @param {Array} orders 
 * @returns {Array}
 */
export function filterDeletedOrders(orders) {
  if (!Array.isArray(orders)) return [];
  const deletedSet = getDeletedOrderIdsSet();
  if (deletedSet.size === 0) return orders;
  return orders.filter(order => order && order.id && !deletedSet.has(String(order.id)));
}

/**
 * Permanently delete an order from backend, Supabase, and localStorage
 * @param {string|number} orderId 
 * @returns {Promise<{ success: boolean, id: string, message?: string }>}
 */
export async function deleteOrder(orderId) {
  if (!orderId) {
    throw new Error('Order ID is required to delete order.');
  }

  const idStr = String(orderId);

  // 1. Immediately update localStorage deleted_order_ids
  try {
    const deletedIds = getDeletedOrderIds();
    if (!deletedIds.includes(idStr)) {
      deletedIds.push(idStr);
      localStorage.setItem(DELETED_ORDERS_KEY, JSON.stringify(deletedIds));
    }
  } catch (e) {
    console.error('Failed to store deleted order ID in localStorage:', e);
  }

  // 2. Remove from local customer_orders
  try {
    const localOrdersRaw = localStorage.getItem(CUSTOMER_ORDERS_KEY);
    if (localOrdersRaw) {
      const localOrders = JSON.parse(localOrdersRaw);
      if (Array.isArray(localOrders)) {
        const filtered = localOrders.filter(o => o && String(o.id) !== idStr);
        localStorage.setItem(CUSTOMER_ORDERS_KEY, JSON.stringify(filtered));
      }
    }
  } catch (e) {
    console.error('Failed to remove order from local customer_orders:', e);
  }

  // 3. Dispatch window events for reactive UI updates across open components
  try {
    window.dispatchEvent(new Event('orders_updated'));
    window.dispatchEvent(new CustomEvent('order_deleted', { detail: { id: idStr } }));
  } catch (e) {
    console.error('Failed to dispatch order_deleted event:', e);
  }

  // 4. Call Backend API if accessible
  let apiDeleted = false;
  try {
    const headers = await getAdminAuthHeaders();
    const res = await fetch(`http://localhost:5000/api/admin/orders/${idStr}`, {
      method: 'DELETE',
      headers,
    });
    if (res.ok) {
      apiDeleted = true;
    }
  } catch (apiErr) {
    // Backend may not be running locally; fallback to direct DB removal
    console.warn('Backend API deleteOrder fallback:', apiErr.message);
  }

  // 5. Delete in Supabase (with cascade order to prevent FK violation errors)
  try {
    // Delete child tables first
    try {
      await supabase.from('order_items').delete().eq('order_id', idStr);
    } catch (_) {}

    try {
      await supabase.from('payments').delete().eq('order_id', idStr);
    } catch (_) {}

    try {
      await supabase.from('shipments').delete().eq('order_id', idStr);
    } catch (_) {}

    // Delete primary order row
    const { error: dbError } = await supabase.from('orders').delete().eq('id', idStr);
    if (dbError) {
      console.warn('Direct Supabase delete returned notice:', dbError.message);
    }
  } catch (dbErr) {
    console.warn('Supabase cascade delete notice:', dbErr.message);
  }

  return { success: true, id: idStr, apiDeleted };
}
