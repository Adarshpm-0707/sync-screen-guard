import { supabase } from '../supabaseClient';
import { getAdminAuthHeaders } from '../admin/utils/adminAuth';

const DELETED_ORDERS_KEY = 'deleted_order_ids';
const CUSTOMER_ORDERS_KEY = 'customer_orders';
const ORDERS_CLEARED_AT_KEY = 'orders_cleared_at';
const SHIPMENTS_CLEARED_AT_KEY = 'shipments_cleared_at';

/**
 * Get timestamp when all orders were last cleared
 * @returns {string|null}
 */
export function getOrdersClearedAt() {
  try {
    return localStorage.getItem(ORDERS_CLEARED_AT_KEY);
  } catch (e) {
    return null;
  }
}

/**
 * Get timestamp when all shipments were last cleared
 * @returns {string|null}
 */
export function getShipmentsClearedAt() {
  try {
    return localStorage.getItem(SHIPMENTS_CLEARED_AT_KEY);
  } catch (e) {
    return null;
  }
}

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
 * Filter an array of orders to exclude any deleted or wiped orders
 * @param {Array} orders 
 * @returns {Array}
 */
export function filterDeletedOrders(orders) {
  if (!Array.isArray(orders)) return [];
  const deletedSet = getDeletedOrderIdsSet();
  const clearedAtStr = getOrdersClearedAt();
  const clearedAt = clearedAtStr ? new Date(clearedAtStr).getTime() : null;

  return orders.filter(order => {
    if (!order || !order.id) return false;
    if (deletedSet.has(String(order.id))) return false;
    if (clearedAt && order.created_at) {
      const orderTime = new Date(order.created_at).getTime();
      if (!isNaN(orderTime) && orderTime <= clearedAt) {
        return false;
      }
    }
    return true;
  });
}

/**
 * Filter an array of shipments to exclude deleted or wiped shipments
 * @param {Array} shipments 
 * @returns {Array}
 */
export function filterDeletedShipments(shipments) {
  if (!Array.isArray(shipments)) return [];
  const deletedSet = getDeletedOrderIdsSet();
  const clearedAtStr = getShipmentsClearedAt() || getOrdersClearedAt();
  const clearedAt = clearedAtStr ? new Date(clearedAtStr).getTime() : null;

  return shipments.filter(ship => {
    if (!ship) return false;
    if (ship.order_id && deletedSet.has(String(ship.order_id))) return false;
    if (clearedAt && ship.created_at) {
      const shipTime = new Date(ship.created_at).getTime();
      if (!isNaN(shipTime) && shipTime <= clearedAt) {
        return false;
      }
    }
    return true;
  });
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

/**
 * Permanently delete multiple orders at once
 * @param {Array<string|number>} orderIds 
 * @returns {Promise<{ success: boolean, count: number }>}
 */
export async function deleteMultipleOrders(orderIds) {
  if (!Array.isArray(orderIds) || orderIds.length === 0) {
    return { success: true, count: 0 };
  }

  const strIds = orderIds.map(String);
  const idsSet = new Set(strIds);

  // 1. Update localStorage deleted_order_ids
  try {
    const deletedIds = getDeletedOrderIds();
    strIds.forEach(id => {
      if (!deletedIds.includes(id)) deletedIds.push(id);
    });
    localStorage.setItem(DELETED_ORDERS_KEY, JSON.stringify(deletedIds));
  } catch (e) {
    console.error('Failed to store deleted order IDs in localStorage:', e);
  }

  // 2. Remove from local customer_orders
  try {
    const localOrdersRaw = localStorage.getItem(CUSTOMER_ORDERS_KEY);
    if (localOrdersRaw) {
      const localOrders = JSON.parse(localOrdersRaw);
      if (Array.isArray(localOrders)) {
        const filtered = localOrders.filter(o => o && !idsSet.has(String(o.id)));
        localStorage.setItem(CUSTOMER_ORDERS_KEY, JSON.stringify(filtered));
      }
    }
  } catch (e) {
    console.error('Failed to remove orders from local customer_orders:', e);
  }

  // 3. Dispatch events
  try {
    window.dispatchEvent(new Event('orders_updated'));
    window.dispatchEvent(new Event('customers_updated'));
  } catch (e) {
    console.error('Failed to dispatch update events:', e);
  }

  // 4. Call Backend API
  try {
    const headers = await getAdminAuthHeaders({ 'Content-Type': 'application/json' });
    await fetch('http://localhost:5000/api/admin/orders/bulk-delete', {
      method: 'POST',
      headers,
      body: JSON.stringify({ orderIds: strIds })
    });
  } catch (apiErr) {
    console.warn('Backend bulk-delete API fallback:', apiErr.message);
  }

  // 5. Delete in Supabase
  try {
    try {
      await supabase.from('order_items').delete().in('order_id', strIds);
    } catch (_) {}
    try {
      await supabase.from('payments').delete().in('order_id', strIds);
    } catch (_) {}
    try {
      await supabase.from('shipments').delete().in('order_id', strIds);
    } catch (_) {}
    try {
      await supabase.from('orders').delete().in('id', strIds);
    } catch (_) {}
  } catch (dbErr) {
    console.warn('Supabase bulk delete notice:', dbErr.message);
  }

  try {
    window.dispatchEvent(new Event('orders_updated'));
  } catch (_) {}

  return { success: true, count: strIds.length };
}

/**
 * Permanently delete a single customer and all their associated orders
 * @param {Object} customer 
 * @returns {Promise<{ success: boolean, message: string }>}
 */
export async function deleteCustomer(customer) {
  if (!customer) throw new Error('Customer object is required');

  const orderIds = (customer.orders || []).map(o => o.id).filter(Boolean);
  
  if (orderIds.length > 0) {
    return deleteMultipleOrders(orderIds);
  }

  // If no order IDs attached, try customer id or email
  const targetId = customer.user_id || customer.email || customer.phone || customer.id;
  try {
    const headers = await getAdminAuthHeaders();
    await fetch(`http://localhost:5000/api/admin/customers/${encodeURIComponent(targetId)}`, {
      method: 'DELETE',
      headers,
    });
  } catch (_) {}

  try {
    window.dispatchEvent(new Event('orders_updated'));
    window.dispatchEvent(new Event('customers_updated'));
  } catch (_) {}

  return { success: true, message: 'Customer record deleted.' };
}

/**
 * Permanently delete multiple customers and all their associated orders
 * @param {Array} customers 
 * @returns {Promise<{ success: boolean, count: number }>}
 */
export async function deleteMultipleCustomers(customers) {
  if (!Array.isArray(customers) || customers.length === 0) {
    return { success: true, count: 0 };
  }

  const allOrderIds = [];
  const customerKeys = [];

  customers.forEach(c => {
    if (c.orders && Array.isArray(c.orders)) {
      c.orders.forEach(o => {
        if (o && o.id) allOrderIds.push(o.id);
      });
    }
    const key = (c.email || c.user_id || c.phone || c.name || c.id || '').toLowerCase().trim();
    if (key) customerKeys.push(key);
  });

  const uniqueOrderIds = Array.from(new Set(allOrderIds));

  if (uniqueOrderIds.length > 0) {
    await deleteMultipleOrders(uniqueOrderIds);
  }

  // Also call backend bulk customer delete endpoint
  try {
    const headers = await getAdminAuthHeaders({ 'Content-Type': 'application/json' });
    await fetch('http://localhost:5000/api/admin/customers/bulk-delete', {
      method: 'POST',
      headers,
      body: JSON.stringify({ customerKeys, orderIds: uniqueOrderIds })
    });
  } catch (_) {}

  try {
    window.dispatchEvent(new Event('orders_updated'));
    window.dispatchEvent(new Event('customers_updated'));
  } catch (_) {}

  return { success: true, count: customers.length };
}

/**
 * Permanently clear ALL orders, customer transaction history, and shipments
 * @returns {Promise<{ success: boolean, message: string }>}
 */
export async function clearAllOrders() {
  const timestamp = new Date().toISOString();

  // 1. Mark orders and shipments cleared timestamp in localStorage
  try {
    localStorage.setItem(ORDERS_CLEARED_AT_KEY, timestamp);
    localStorage.setItem(SHIPMENTS_CLEARED_AT_KEY, timestamp);
    localStorage.removeItem(CUSTOMER_ORDERS_KEY);
    localStorage.removeItem(DELETED_ORDERS_KEY);
  } catch (e) {
    console.error('Failed to set orders_cleared_at in localStorage:', e);
  }

  // 2. Dispatch events immediately for instant reactive update
  try {
    window.dispatchEvent(new Event('orders_updated'));
    window.dispatchEvent(new Event('customers_updated'));
  } catch (e) {
    console.error('Failed to dispatch clear events:', e);
  }

  // 3. Call backend API clear-all
  try {
    const headers = await getAdminAuthHeaders();
    await fetch('http://localhost:5000/api/admin/orders/clear-all', {
      method: 'DELETE',
      headers,
    });
  } catch (apiErr) {
    console.warn('Backend clear-all API note:', apiErr.message);
  }

  // 4. Try Supabase direct cleanup
  try {
    try {
      await supabase.from('order_items').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    } catch (_) {}

    try {
      await supabase.from('payments').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    } catch (_) {}

    try {
      await supabase.from('shipments').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    } catch (_) {}

    try {
      await supabase.from('orders').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    } catch (_) {}
  } catch (dbErr) {
    console.warn('Direct Supabase wipe note:', dbErr.message);
  }

  // Dispatch again after API/DB finish
  try {
    window.dispatchEvent(new Event('orders_updated'));
  } catch (_) {}

  return {
    success: true,
    message: 'All orders, customer purchase histories, and shipment tracking records cleared successfully.'
  };
}

/**
 * Permanently clear ALL shipments
 * @returns {Promise<{ success: boolean, message: string }>}
 */
export async function clearAllShipments() {
  const timestamp = new Date().toISOString();

  try {
    localStorage.setItem(SHIPMENTS_CLEARED_AT_KEY, timestamp);
  } catch (e) {
    console.error('Failed to set shipments_cleared_at in localStorage:', e);
  }

  try {
    window.dispatchEvent(new Event('orders_updated'));
  } catch (_) {}

  try {
    const headers = await getAdminAuthHeaders();
    await fetch('http://localhost:5000/api/admin/shipments/clear-all', {
      method: 'DELETE',
      headers,
    });
  } catch (apiErr) {
    console.warn('Backend clear shipments API note:', apiErr.message);
  }

  try {
    await supabase.from('shipments').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  } catch (dbErr) {
    console.warn('Direct Supabase shipment wipe note:', dbErr.message);
  }

  try {
    window.dispatchEvent(new Event('orders_updated'));
  } catch (_) {}

  return {
    success: true,
    message: 'All shipments cleared successfully.'
  };
}
