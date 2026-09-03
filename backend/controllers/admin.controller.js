import { supabaseAdmin } from '../supabase.js';
import {
  createShiprocketOrder,
  assignAWBAndRequestPickup,
  trackShiprocketShipment,
  syncAllShipmentStatuses,
  handleShiprocketWebhook,
  cancelShiprocketOrder
} from '../services/shiprocket.service.js';

// Detect mock simulation mode
export const rawUrl = process.env.SUPABASE_URL;
export const isMockMode = !rawUrl || rawUrl.includes('your_supabase_url') || rawUrl.includes('placeholder-url');

// ----------------------------------------------------
// LOCAL IN-MEMORY DATABASE MOCK DATA (for offline/simulated mode)
// ----------------------------------------------------
export let mockOrders = [];
export let mockOrderItems = [];
export let mockProducts = [];
export let mockShipments = [];
export let ordersClearedTimestamp = null;
export let shipmentsClearedTimestamp = null;

let mockSettings = {
  id: 'default',
  cod_fee: 50.00,
  cod_enabled: true,
  razorpay_key_id: 'rzp_test_placeholderkey12345'
};


// Helper to fallback settings when DB table is not created
async function getPaymentSettings() {
  if (isMockMode) {
    return mockSettings;
  }
  try {
    const { data, error } = await supabaseAdmin
      .from('payment_settings')
      .select('*')
      .eq('id', 'default')
      .single();

    if (error || !data) {
      return {
        id: 'default',
        cod_fee: parseFloat(process.env.COD_FEE !== undefined ? process.env.COD_FEE : 0),
        cod_enabled: true,
        razorpay_key_id: process.env.RAZORPAY_KEY_ID || 'rzp_live_TWkmVWiZfERb3p',
      };
    }
    return data;
  } catch (err) {
    return {
      id: 'default',
      cod_fee: parseFloat(process.env.COD_FEE !== undefined ? process.env.COD_FEE : 0),
      cod_enabled: true,
      razorpay_key_id: process.env.RAZORPAY_KEY_ID || 'rzp_live_TWkmVWiZfERb3p',
    };
  }
}

// 1. GET Dashboard Stats
export async function getDashboardStats(req, res, next) {
  try {
    if (isMockMode) {
      // Calculate revenue stats from mock data
      const totalOrdersVal = mockOrders.length;
      const pendingOrdersVal = mockOrders.filter(o => o.status === 'pending').length;
      
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);
      
      const revenueTodayVal = mockOrders
        .filter(o => o.status !== 'cancelled' && new Date(o.created_at) >= startOfToday)
        .reduce((sum, o) => sum + o.total, 0);

      const codCountVal = mockOrders.filter(o => o.payment_type === 'cod').length;
      const prepaidCountVal = mockOrders.filter(o => o.payment_type === 'razorpay').length;
      
      // Sales History past 7 days
      const salesHistory = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateString = d.toLocaleDateString();

        const start = new Date(d);
        start.setHours(0, 0, 0, 0);
        const end = new Date(d);
        end.setHours(23, 59, 59, 999);

        const dayRevenue = mockOrders
          .filter(o => o.status !== 'cancelled' && new Date(o.created_at) >= start && new Date(o.created_at) <= end)
          .reduce((sum, o) => sum + o.total, 0);

        salesHistory.push({ date: dateString, revenue: dayRevenue });
      }

      return res.status(200).json({
        stats: {
          totalOrders: totalOrdersVal,
          pendingOrders: pendingOrdersVal,
          revenueToday: revenueTodayVal,
          codCount: codCountVal,
          prepaidCount: prepaidCountVal
        },
        recentOrders: mockOrders.slice(0, 10),
        salesHistory
      });
    }

    // Real Supabase Mode
    let totalQuery = supabaseAdmin.from('orders').select('*', { count: 'exact', head: true });
    let pendingQuery = supabaseAdmin.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'pending');
    let codQuery = supabaseAdmin.from('orders').select('*', { count: 'exact', head: true }).eq('payment_type', 'cod');
    let prepaidQuery = supabaseAdmin.from('orders').select('*', { count: 'exact', head: true }).eq('payment_type', 'razorpay');
    let recentQuery = supabaseAdmin.from('orders').select('*').order('created_at', { ascending: false }).limit(10);

    if (ordersClearedTimestamp) {
      totalQuery = totalQuery.gt('created_at', ordersClearedTimestamp);
      pendingQuery = pendingQuery.gt('created_at', ordersClearedTimestamp);
      codQuery = codQuery.gt('created_at', ordersClearedTimestamp);
      prepaidQuery = prepaidQuery.gt('created_at', ordersClearedTimestamp);
      recentQuery = recentQuery.gt('created_at', ordersClearedTimestamp);
    }

    const { count: totalOrders } = await totalQuery;
    const { count: pendingOrders } = await pendingQuery;
    const { count: codCount } = await codQuery;
    const { count: prepaidCount } = await prepaidQuery;
    const { data: recentOrders } = await recentQuery;

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    let todayOrdersQuery = supabaseAdmin
      .from('orders')
      .select('total')
      .neq('status', 'cancelled')
      .gte('created_at', startOfToday.toISOString());

    if (ordersClearedTimestamp) {
      todayOrdersQuery = todayOrdersQuery.gt('created_at', ordersClearedTimestamp);
    }

    const { data: todayOrders } = await todayOrdersQuery;
    const revenueToday = (todayOrders || []).reduce((acc, curr) => acc + parseFloat(curr.total), 0);

    const salesHistory = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateString = d.toLocaleDateString();

      const start = new Date(d);
      start.setHours(0, 0, 0, 0);
      const end = new Date(d);
      end.setHours(23, 59, 59, 999);

      let dayOrdersQuery = supabaseAdmin
        .from('orders')
        .select('total')
        .neq('status', 'cancelled')
        .gte('created_at', start.toISOString())
        .lte('created_at', end.toISOString());

      if (ordersClearedTimestamp) {
        dayOrdersQuery = dayOrdersQuery.gt('created_at', ordersClearedTimestamp);
      }

      const { data: dayOrders } = await dayOrdersQuery;
      const dailyRevenue = (dayOrders || []).reduce((acc, curr) => acc + parseFloat(curr.total), 0);
      salesHistory.push({
        date: dateString,
        revenue: dailyRevenue,
      });
    }

    res.status(200).json({
      stats: {
        totalOrders: totalOrders || 0,
        pendingOrders: pendingOrders || 0,
        revenueToday,
        codCount: codCount || 0,
        prepaidCount: prepaidCount || 0,
      },
      recentOrders: recentOrders || [],
      salesHistory,
    });
  } catch (err) {
    next(err);
  }
}

// 2. GET Filtered Orders List
export async function getOrders(req, res, next) {
  try {
    const { page = 1, limit = 10, status, payment, search, customerType } = req.query;
    const offset = (page - 1) * limit;

    if (isMockMode) {
      let filtered = [...mockOrders];
      if (status && status !== 'all') {
        filtered = filtered.filter(o => o.status === status);
      }
      if (payment && payment !== 'all') {
        filtered = filtered.filter(o => o.payment_type === payment);
      }
      if (customerType && customerType !== 'all') {
        if (customerType === 'guest') {
          filtered = filtered.filter(o => o.is_guest || !o.user_id);
        } else if (customerType === 'registered') {
          filtered = filtered.filter(o => !o.is_guest && o.user_id);
        }
      }
      if (search) {
        filtered = filtered.filter(o => o.customer_name.toLowerCase().includes(search.toLowerCase()));
      }

      const totalItems = filtered.length;
      const paginated = filtered.slice(offset, offset + parseInt(limit));

      return res.status(200).json({
        orders: paginated,
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
        currentPage: parseInt(page)
      });
    }

    let query = supabaseAdmin
      .from('orders')
      .select('*', { count: 'exact' });

    if (ordersClearedTimestamp) {
      query = query.gt('created_at', ordersClearedTimestamp);
    }

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }
    if (payment && payment !== 'all') {
      query = query.eq('payment_type', payment);
    }
    if (customerType && customerType !== 'all') {
      if (customerType === 'guest') {
        query = query.or('is_guest.eq.true,user_id.is.null');
      } else if (customerType === 'registered') {
        query = query.eq('is_guest', false).not('user_id', 'is', null);
      }
    }
    if (search) {
      query = query.ilike('customer_name', `%${search}%`);
    }

    const { data: orders, count, error } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    res.status(200).json({
      orders: orders || [],
      totalItems: count || 0,
      totalPages: Math.ceil((count || 0) / limit),
      currentPage: parseInt(page),
    });
  } catch (err) {
    next(err);
  }
}

// 3. GET Single Order Details
export async function getOrderDetail(req, res, next) {
  try {
    const { id } = req.params;

    if (isMockMode) {
      const order = mockOrders.find(o => o.id === id);
      if (!order) {
        return res.status(404).json({ message: 'Order not found.' });
      }
      const items = mockOrderItems.filter(item => item.order_id === id);
      return res.status(200).json({
        ...order,
        items,
        payment_status: order.payment_status || 'pending'
      });
    }

    const { data: order, error } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !order) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    const { data: items } = await supabaseAdmin
      .from('order_items')
      .select('*, products(name)')
      .eq('order_id', id);

    const { data: payment } = await supabaseAdmin
      .from('payments')
      .select('*')
      .eq('order_id', id)
      .single();

    res.status(200).json({
      ...order,
      items: (items || []).map(item => ({
        ...item,
        product_name: item.products?.name,
      })),
      payment_status: payment?.status || 'pending',
    });
  } catch (err) {
    next(err);
  }
}

// 4. PATCH Update Order Status
export async function updateOrderStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (isMockMode) {
      const idx = mockOrders.findIndex(o => o.id === id);
      if (idx === -1) {
        return res.status(404).json({ message: 'Order not found.' });
      }
      mockOrders[idx].status = status;
      if (status === 'confirmed') {
        mockOrders[idx].payment_status = 'success';
      }
      if (status === 'cancelled') {
        cancelShiprocketOrder({ orderId: id }).catch(e => console.warn('Shiprocket cancel notice:', e.message));
      }
      return res.status(200).json(mockOrders[idx]);
    }

    const { data: updatedOrder, error } = await supabaseAdmin
      .from('orders')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error || !updatedOrder) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    // 🚀 If order is cancelled, automatically cancel on Shiprocket dashboard!
    if (status === 'cancelled') {
      cancelShiprocketOrder({ orderId: id }).catch(e => {
        console.warn('Shiprocket cancellation notice on admin status change:', e.message);
      });
    }

    res.status(200).json(updatedOrder);
  } catch (err) {
    next(err);
  }
}

// 4b. DELETE Order
export async function deleteOrder(req, res, next) {
  try {
    const { id } = req.params;

    // Automatically remove/cancel from Shiprocket before deleting
    cancelShiprocketOrder({ orderId: id }).catch(e => {
      console.warn('Shiprocket cancellation notice on order delete:', e.message);
    });

    if (isMockMode) {
      const idx = mockOrders.findIndex(o => o.id === id);
      if (idx === -1) {
        return res.status(404).json({ message: 'Order not found.' });
      }
      mockOrders.splice(idx, 1);
      // Also remove related items
      const itemsBefore = mockOrderItems.length;
      mockOrderItems.splice(0, itemsBefore, ...mockOrderItems.filter(item => item.order_id !== id));
      return res.status(200).json({ success: true, message: 'Order deleted successfully.' });
    }

    // Delete related order_items first (if no cascade on DB)
    await supabaseAdmin.from('order_items').delete().eq('order_id', id);

    // Delete related payments
    await supabaseAdmin.from('payments').delete().eq('order_id', id);

    // Delete shipment record
    await supabaseAdmin.from('shipments').delete().eq('order_id', id);

    const { error } = await supabaseAdmin
      .from('orders')
      .delete()
      .eq('id', id);

    if (error) {
      return res.status(404).json({ message: 'Order not found or could not be deleted.' });
    }

    res.status(200).json({ success: true, message: 'Order deleted successfully.' });
  } catch (err) {
    next(err);
  }
}

// 4c. DELETE / CLEAR ALL Orders & Associated Data
export async function clearAllOrders(req, res, next) {
  try {
    ordersClearedTimestamp = new Date().toISOString();
    shipmentsClearedTimestamp = ordersClearedTimestamp;
    mockOrders.length = 0;
    mockOrderItems.length = 0;
    mockShipments.length = 0;

    // Supabase DB cleanup
    try {
      await supabaseAdmin.from('order_items').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    } catch (_) {}
    try {
      await supabaseAdmin.from('payments').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    } catch (_) {}
    try {
      await supabaseAdmin.from('shipments').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    } catch (_) {}
    try {
      await supabaseAdmin.from('orders').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    } catch (_) {}

    return res.status(200).json({
      success: true,
      message: 'All orders, items, customer histories, and shipment tracking records have been cleared successfully.'
    });
  } catch (err) {
    next(err);
  }
}

// 4d. DELETE / CLEAR ALL Shipments
export async function clearAllShipments(req, res, next) {
  try {
    shipmentsClearedTimestamp = new Date().toISOString();
    mockShipments.length = 0;

    try {
      await supabaseAdmin.from('shipments').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    } catch (_) {}

    return res.status(200).json({
      success: true,
      message: 'All shipment records have been cleared successfully.'
    });
  } catch (err) {
    next(err);
  }
}

// 4e. DELETE / CLEAR ALL Customers
export async function clearAllCustomers(req, res, next) {
  return clearAllOrders(req, res, next);
}

// 4f. POST/DELETE Bulk Delete Multiple Orders
export async function deleteMultipleOrders(req, res, next) {
  try {
    const { orderIds = [] } = req.body;
    if (!Array.isArray(orderIds) || orderIds.length === 0) {
      return res.status(400).json({ message: 'No order IDs provided for deletion.' });
    }

    const idsSet = new Set(orderIds.map(String));

    // Cancel from Shiprocket in background
    for (const orderId of orderIds) {
      cancelShiprocketOrder({ orderId }).catch(() => {});
    }

    if (isMockMode) {
      const remainingOrders = mockOrders.filter(o => !idsSet.has(String(o.id)));
      mockOrders.length = 0;
      mockOrders.push(...remainingOrders);

      const remainingItems = mockOrderItems.filter(i => !idsSet.has(String(i.order_id)));
      mockOrderItems.length = 0;
      mockOrderItems.push(...remainingItems);

      const remainingShip = mockShipments.filter(s => !idsSet.has(String(s.order_id)));
      mockShipments.length = 0;
      mockShipments.push(...remainingShip);

      return res.status(200).json({
        success: true,
        deletedCount: orderIds.length,
        message: `${orderIds.length} orders deleted successfully.`
      });
    }

    // Direct Supabase deletion
    try {
      await supabaseAdmin.from('order_items').delete().in('order_id', orderIds);
    } catch (_) {}
    try {
      await supabaseAdmin.from('payments').delete().in('order_id', orderIds);
    } catch (_) {}
    try {
      await supabaseAdmin.from('shipments').delete().in('order_id', orderIds);
    } catch (_) {}
    try {
      await supabaseAdmin.from('orders').delete().in('id', orderIds);
    } catch (_) {}

    return res.status(200).json({
      success: true,
      deletedCount: orderIds.length,
      message: `${orderIds.length} orders deleted successfully.`
    });
  } catch (err) {
    next(err);
  }
}

// 4g. DELETE Single Customer & Associated Orders
export async function deleteCustomer(req, res, next) {
  try {
    const { id } = req.params;
    let allOrders = [];

    if (isMockMode) {
      allOrders = [...mockOrders];
    } else {
      const { data: dbOrders } = await supabaseAdmin.from('orders').select('*');
      allOrders = dbOrders || [];
    }

    const matchingOrders = allOrders.filter(o => {
      const custId = o.user_id || `cust-${Buffer.from((o.customer_email || o.phone || o.customer_name || '').toLowerCase().trim()).toString('hex').slice(0, 16)}`;
      return custId === id || o.user_id === id || (o.customer_email && o.customer_email.toLowerCase() === id.toLowerCase()) || (o.phone && o.phone === id);
    });

    const orderIds = matchingOrders.map(o => o.id);
    if (orderIds.length > 0) {
      req.body = { orderIds };
      return deleteMultipleOrders(req, res, next);
    }

    return res.status(200).json({ success: true, message: 'Customer record deleted.' });
  } catch (err) {
    next(err);
  }
}

// 4h. POST/DELETE Bulk Delete Multiple Customers
export async function deleteMultipleCustomers(req, res, next) {
  try {
    const { customerKeys = [], orderIds = [] } = req.body;
    let targetOrderIds = [...orderIds];

    if (customerKeys.length > 0) {
      let allOrders = [];
      if (isMockMode) {
        allOrders = [...mockOrders];
      } else {
        const { data: dbOrders } = await supabaseAdmin.from('orders').select('*');
        allOrders = dbOrders || [];
      }

      const matchingOrders = allOrders.filter(o => {
        const custKey = (o.customer_email || o.user_id || o.phone || o.customer_name || 'unknown').toLowerCase().trim();
        const custId = o.user_id || `cust-${Buffer.from(custKey).toString('hex').slice(0, 16)}`;
        return customerKeys.includes(custKey) || customerKeys.includes(custId) || customerKeys.includes(o.user_id) || customerKeys.includes(o.customer_email) || customerKeys.includes(o.phone);
      });

      targetOrderIds = Array.from(new Set([...targetOrderIds, ...matchingOrders.map(o => o.id)]));
    }

    if (targetOrderIds.length > 0) {
      req.body = { orderIds: targetOrderIds };
      return deleteMultipleOrders(req, res, next);
    }

    return res.status(200).json({ success: true, message: 'Selected customers deleted.' });
  } catch (err) {
    next(err);
  }
}


// 5. GET All Products

export async function getProducts(req, res, next) {
  try {
    if (isMockMode) {
      return res.status(200).json(mockProducts);
    }

    const { data: products, error } = await supabaseAdmin
      .from('products')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) throw error;
    res.status(200).json(products);
  } catch (err) {
    next(err);
  }
}

// 5b. POST Create Product
export async function createProduct(req, res, next) {
  try {
    const { name, price, original_price, description, images, stock, theme_color } = req.body;

    if (isMockMode) {
      const newProduct = {
        id: `prod-${Date.now()}`,
        name,
        price,
        original_price,
        description,
        images: images || [],
        stock: stock || 0,
        theme_color: theme_color || 'blue',
        created_at: new Date().toISOString(),
      };
      mockProducts.push(newProduct);
      return res.status(201).json(newProduct);
    }

    const { data: product, error } = await supabaseAdmin
      .from('products')
      .insert({ name, price, original_price, description, images, stock, theme_color })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(product);
  } catch (err) {
    next(err);
  }
}

// 5d. DELETE Product
export async function deleteProduct(req, res, next) {
  try {
    const { id } = req.params;

    if (isMockMode) {
      const idx = mockProducts.findIndex(p => p.id === id);
      if (idx !== -1) {
        mockProducts.splice(idx, 1);
      }
      return res.status(200).json({ success: true, message: 'Product deleted' });
    }

    const { error } = await supabaseAdmin
      .from('products')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.status(200).json({ success: true, message: 'Product deleted successfully' });
  } catch (err) {
    next(err);
  }
}

// 6. PUT/PATCH Update Product
export async function updateProduct(req, res, next) {
  try {
    const { id } = req.params;
    const { name, price, original_price, description, images, stock, theme_color } = req.body;

    if (isMockMode) {
      const idx = mockProducts.findIndex(p => p.id === id);
      if (idx === -1) {
        return res.status(404).json({ message: 'Product not found.' });
      }
      mockProducts[idx] = { ...mockProducts[idx], name, price, original_price, description, images, stock, theme_color };
      return res.status(200).json(mockProducts[idx]);
    }

    const { data: updatedProduct, error } = await supabaseAdmin
      .from('products')
      .update({ name, price, original_price, description, images, stock, theme_color })
      .eq('id', id)
      .select()
      .single();

    if (error || !updatedProduct) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    res.status(200).json(updatedProduct);
  } catch (err) {
    next(err);
  }
}

// 7. PATCH Quick Stock Editor
export async function updateProductStock(req, res, next) {
  try {
    const { id } = req.params;
    const { stock } = req.body;

    if (isMockMode) {
      const idx = mockProducts.findIndex(p => p.id === id);
      if (idx === -1) {
        return res.status(404).json({ message: 'Product not found.' });
      }
      mockProducts[idx].stock = stock;
      return res.status(200).json(mockProducts[idx]);
    }

    const { data: updatedProduct, error } = await supabaseAdmin
      .from('products')
      .update({ stock })
      .eq('id', id)
      .select()
      .single();

    if (error || !updatedProduct) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    res.status(200).json(updatedProduct);
  } catch (err) {
    next(err);
  }
}

// 8. GET Shipments
export async function getShipments(req, res, next) {
  try {
    if (isMockMode) {
      return res.status(200).json(mockShipments);
    }

    let query = supabaseAdmin
      .from('shipments')
      .select('*, orders(customer_name, phone, total, city, status)')
      .order('created_at', { ascending: false });

    if (shipmentsClearedTimestamp) {
      query = query.gt('created_at', shipmentsClearedTimestamp);
    }

    const { data: shipments, error } = await query;

    if (error) {
      // Fallback without join
      let fallbackQuery = supabaseAdmin
        .from('shipments')
        .select('*')
        .order('created_at', { ascending: false });

      if (shipmentsClearedTimestamp) {
        fallbackQuery = fallbackQuery.gt('created_at', shipmentsClearedTimestamp);
      }

      const { data: rawShipments } = await fallbackQuery;
      return res.status(200).json(rawShipments || []);
    }

    res.status(200).json(shipments || []);
  } catch (err) {
    next(err);
  }
}

// 9. POST Create shipment (Push order to Shiprocket & Assign AWB)
export async function createShipment(req, res, next) {
  try {
    const { orderId, courierId } = req.body;

    if (isMockMode) {
      const order = mockOrders.find(o => o.id === orderId);
      if (!order) {
        return res.status(404).json({ message: 'Order not found.' });
      }

      // Check if Shiprocket credentials exist to try live push even in mock mode
      const srResult = await createShiprocketOrder(order, mockOrderItems.filter(i => i.order_id === orderId));

      const awb = srResult?.awb || `SR-${Math.floor(100000000 + Math.random() * 900000000)}`;
      const trackingUrl = srResult?.tracking_url || `https://shiprocket.co/tracking/${awb}`;
      const etaDate = new Date();
      etaDate.setDate(etaDate.getDate() + 4);

      const shipment = {
        id: `ship-${Date.now()}`,
        order_id: orderId,
        shiprocket_order_id: srResult?.shiprocket_order_id || `SR-ORD-${Math.floor(100000 + Math.random() * 900000)}`,
        awb,
        status: srResult?.status === 'NEW' ? 'dispatched' : (srResult?.status || 'dispatched'),
        tracking_url: trackingUrl,
        eta: etaDate.toISOString(),
        courier_name: srResult?.courier_name || 'Shiprocket Express',
        created_at: new Date().toISOString()
      };

      mockShipments.unshift(shipment);

      const oIdx = mockOrders.findIndex(o => o.id === orderId);
      if (oIdx !== -1) {
        mockOrders[oIdx].status = 'shipped';
      }

      return res.status(201).json(shipment);
    }

    // Supabase Mode
    const { data: order, error: orderErr } = await supabaseAdmin
      .from('orders')
      .select('*, order_items(*)')
      .eq('id', orderId)
      .single();

    if (orderErr || !order) {
      return res.status(404).json({ message: 'Order not found in database.' });
    }

    // 🚀 1. Push to Shiprocket API
    let srResult = await createShiprocketOrder(order, order.order_items || []);

    // 📦 2. If shipment_id obtained, optionally assign AWB & request pickup
    let awbCode = srResult?.awb || null;
    let courierName = srResult?.courier_name || 'Shiprocket Express';

    if (srResult?.shipment_id) {
      const awbResult = await assignAWBAndRequestPickup(srResult.shipment_id, courierId);
      if (awbResult?.awb_code) {
        awbCode = awbResult.awb_code;
        courierName = awbResult.courier_name || courierName;
      }
    }

    const finalAwb = awbCode || `SR-${Math.floor(100000000 + Math.random() * 900000000)}`;
    const trackingUrl = `https://shiprocket.co/tracking/${finalAwb}`;

    // 3. Upsert / Insert into Supabase shipments table
    const { data: existingShipment } = await supabaseAdmin
      .from('shipments')
      .select('id')
      .eq('order_id', orderId)
      .maybeSingle();

    let shipmentRecord;
    if (existingShipment?.id) {
      const { data: updated, error: uErr } = await supabaseAdmin
        .from('shipments')
        .update({
          shiprocket_order_id: srResult?.shiprocket_order_id || null,
          awb: finalAwb,
          courier_name: courierName,
          status: 'dispatched',
          tracking_url: trackingUrl
        })
        .eq('id', existingShipment.id)
        .select()
        .single();
      if (uErr) throw uErr;
      shipmentRecord = updated;
    } else {
      const { data: inserted, error: iErr } = await supabaseAdmin
        .from('shipments')
        .insert({
          order_id: orderId,
          shiprocket_order_id: srResult?.shiprocket_order_id || null,
          awb: finalAwb,
          courier_name: courierName,
          status: 'dispatched',
          tracking_url: trackingUrl,
          created_at: new Date().toISOString()
        })
        .select()
        .single();
      if (iErr) throw iErr;
      shipmentRecord = inserted;
    }

    // 4. Update order status to shipped
    await supabaseAdmin
      .from('orders')
      .update({ status: 'shipped' })
      .eq('id', orderId);

    console.log(`🚚 [Shiprocket] Shipment created and Order #${orderId} marked as shipped!`);
    res.status(201).json(shipmentRecord);
  } catch (err) {
    console.error('Error creating shipment:', err);
    next(err);
  }
}

// 9b. POST Synchronize all tracking statuses from Shiprocket
export async function syncShipments(req, res, next) {
  try {
    const result = await syncAllShipmentStatuses();
    res.status(200).json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
}

// 9c. POST Shiprocket Live Webhook Handler
export async function handleShiprocketWebhookCall(req, res, next) {
  try {
    const result = await handleShiprocketWebhook(req.body);
    res.status(200).json(result);
  } catch (err) {
    console.error('Webhook error:', err);
    res.status(200).json({ success: false, error: err.message });
  }
}


// 10. GET Payment settings configurations
export async function getSettings(req, res, next) {
  try {
    const settings = await getPaymentSettings();
    res.status(200).json(settings);
  } catch (err) {
    next(err);
  }
}

// 11. PATCH Payment settings configurations
export async function updateSettings(req, res, next) {
  try {
    const { cod_fee, cod_enabled } = req.body;
    
    if (isMockMode) {
      mockSettings.cod_fee = cod_fee;
      mockSettings.cod_enabled = cod_enabled;
      return res.status(200).json(mockSettings);
    }

    const { data, error } = await supabaseAdmin
      .from('payment_settings')
      .upsert({
        id: 'default',
        cod_fee,
        cod_enabled,
      })
      .select()
      .single();

    if (error) {
      return res.status(200).json({
        id: 'default',
        cod_fee,
        cod_enabled,
        razorpay_key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
      });
    }

    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
}

// 12. GET Customers Aggregated List & Stats
export async function getCustomers(req, res, next) {
  try {
    const { search = '', customerType = 'all', sort = 'recent', page = 1, limit = 10 } = req.query;
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    const offset = (pageNum - 1) * limitNum;

    let allOrders = [];

    if (isMockMode) {
      allOrders = [...mockOrders];
    } else {
      let query = supabaseAdmin
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (ordersClearedTimestamp) {
        query = query.gt('created_at', ordersClearedTimestamp);
      }

      const { data: dbOrders, error } = await query;

      if (error) {
        console.warn('Supabase orders fetch for customers failed:', error);
      }
      allOrders = dbOrders || [];
    }

    // Group orders by unique customer identifier (email or phone or user_id)
    const customerMap = new Map();

    allOrders.forEach(order => {
      const key = (order.customer_email || order.user_id || order.phone || order.customer_name || 'unknown').toLowerCase().trim();
      const isGuest = order.is_guest === true || (!order.user_id && order.is_guest !== false);

      if (!customerMap.has(key)) {
        customerMap.set(key, {
          id: order.user_id || `cust-${Buffer.from(key).toString('hex').slice(0, 16)}`,
          user_id: order.user_id || null,
          name: order.customer_name || 'Customer',
          email: order.customer_email || '',
          phone: order.phone || '',
          is_guest: isGuest,
          total_orders: 0,
          total_spent: 0,
          first_seen: order.created_at,
          last_active: order.created_at,
          addresses: [],
          orders: []
        });
      }

      const cust = customerMap.get(key);
      cust.total_orders += 1;
      cust.total_spent += parseFloat(order.total || 0);

      // If any order has is_guest === false or valid user_id, consider customer registered
      if (order.user_id || order.is_guest === false) {
        cust.is_guest = false;
        if (order.user_id) cust.user_id = order.user_id;
      }

      // Track timestamps
      if (new Date(order.created_at) < new Date(cust.first_seen)) {
        cust.first_seen = order.created_at;
      }
      if (new Date(order.created_at) > new Date(cust.last_active)) {
        cust.last_active = order.created_at;
      }

      // Track addresses
      const addrKey = `${order.address || ''}_${order.city || ''}_${order.pincode || ''}`;
      if (order.address && !cust.addresses.some(a => a._key === addrKey)) {
        cust.addresses.push({
          _key: addrKey,
          address: order.address,
          city: order.city || '',
          state: order.state || '',
          pincode: order.pincode || ''
        });
      }

      // Track order record
      cust.orders.push({
        id: order.id,
        created_at: order.created_at,
        status: order.status,
        total: order.total,
        payment_type: order.payment_type,
        payment_status: order.payment_status || 'pending',
        city: order.city,
        state: order.state,
      });
    });

    let customersList = Array.from(customerMap.values()).map(c => ({
      ...c,
      primary_address: c.addresses.length > 0 ? `${c.addresses[0].address}, ${c.addresses[0].city} ${c.addresses[0].pincode}` : 'No address provided',
      total_spent: Math.round(c.total_spent * 100) / 100
    }));

    // Calculate Summary Stats
    const totalCustomers = customersList.length;
    const registeredCount = customersList.filter(c => !c.is_guest).length;
    const guestCount = customersList.filter(c => c.is_guest).length;
    const totalCustomerRevenue = customersList.reduce((sum, c) => sum + c.total_spent, 0);
    const repeatCustomersCount = customersList.filter(c => c.total_orders > 1).length;
    const avgOrderValue = totalCustomers > 0 ? (totalCustomerRevenue / (allOrders.length || 1)) : 0;

    // Apply Filter: customerType
    if (customerType === 'registered') {
      customersList = customersList.filter(c => !c.is_guest);
    } else if (customerType === 'guest') {
      customersList = customersList.filter(c => c.is_guest);
    }

    // Apply Search Filter
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      customersList = customersList.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        c.addresses.some(a => a.city.toLowerCase().includes(q) || a.state.toLowerCase().includes(q) || a.pincode.includes(q))
      );
    }

    // Apply Sorting
    if (sort === 'spent') {
      customersList.sort((a, b) => b.total_spent - a.total_spent);
    } else if (sort === 'orders') {
      customersList.sort((a, b) => b.total_orders - a.total_orders);
    } else if (sort === 'name') {
      customersList.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      // Default: recent activity
      customersList.sort((a, b) => new Date(b.last_active) - new Date(a.last_active));
    }

    const filteredTotal = customersList.length;
    const paginatedCustomers = customersList.slice(offset, offset + limitNum);

    res.status(200).json({
      customers: paginatedCustomers,
      stats: {
        totalCustomers,
        registeredCount,
        guestCount,
        totalCustomerRevenue: Math.round(totalCustomerRevenue * 100) / 100,
        repeatCustomersCount,
        avgOrderValue: Math.round(avgOrderValue * 100) / 100,
      },
      totalItems: filteredTotal,
      totalPages: Math.ceil(filteredTotal / limitNum) || 1,
      currentPage: pageNum
    });
  } catch (err) {
    next(err);
  }
}

// 13. GET Single Customer Details
export async function getCustomerDetail(req, res, next) {
  try {
    const { id } = req.params;
    let allOrders = [];

    if (isMockMode) {
      allOrders = [...mockOrders];
    } else {
      const { data: dbOrders } = await supabaseAdmin
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });
      allOrders = dbOrders || [];
    }

    // Match either by customer id, user_id, or email
    const matchingOrders = allOrders.filter(o => {
      const custId = o.user_id || `cust-${Buffer.from((o.customer_email || o.phone || o.customer_name || '').toLowerCase().trim()).toString('hex').slice(0, 16)}`;
      return custId === id || o.user_id === id || (o.customer_email && o.customer_email.toLowerCase() === id.toLowerCase());
    });

    if (matchingOrders.length === 0) {
      return res.status(404).json({ message: 'Customer not found.' });
    }

    const primary = matchingOrders[0];
    const isGuest = !matchingOrders.some(o => o.user_id || o.is_guest === false);
    const totalSpent = matchingOrders.reduce((sum, o) => sum + parseFloat(o.total || 0), 0);

    const addresses = [];
    matchingOrders.forEach(o => {
      const addrKey = `${o.address || ''}_${o.city || ''}_${o.pincode || ''}`;
      if (o.address && !addresses.some(a => a._key === addrKey)) {
        addresses.push({
          _key: addrKey,
          address: o.address,
          city: o.city || '',
          state: o.state || '',
          pincode: o.pincode || ''
        });
      }
    });

    const customerDetail = {
      id,
      user_id: matchingOrders.find(o => o.user_id)?.user_id || null,
      name: primary.customer_name || 'Customer',
      email: primary.customer_email || '',
      phone: primary.phone || '',
      is_guest: isGuest,
      total_orders: matchingOrders.length,
      total_spent: Math.round(totalSpent * 100) / 100,
      first_seen: matchingOrders[matchingOrders.length - 1]?.created_at || primary.created_at,
      last_active: primary.created_at,
      addresses,
      orders: matchingOrders
    };

    res.status(200).json(customerDetail);
  } catch (err) {
    next(err);
  }
}

// ----------------------------------------------------
// ADMIN PERSONNEL MANAGEMENT
// ----------------------------------------------------
export let mockAdmins = [
  {
    id: 'admin-root-001',
    email: 'admin@syncarmor.in',
    name: 'Sync Superadmin',
    role: 'superadmin',
    status: 'active',
    created_at: '2025-01-01T00:00:00.000Z',
    last_sign_in_at: new Date().toISOString(),
    is_root: true,
  },
  {
    id: 'admin-sec-002',
    email: 'adarshpm0707@gmail.com',
    name: 'Adarsh P M',
    role: 'superadmin',
    status: 'active',
    created_at: '2025-01-15T00:00:00.000Z',
    last_sign_in_at: new Date().toISOString(),
    is_root: false,
  }
];

export async function getAdmins(req, res, next) {
  try {
    if (isMockMode) {
      return res.status(200).json({ success: true, admins: mockAdmins });
    }

    try {
      const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers();
      if (!error && users) {
        const adminUsers = users
          .filter(u => u.user_metadata?.is_admin === true || u.app_metadata?.is_admin === true || u.email?.includes('admin'))
          .map(u => ({
            id: u.id,
            email: u.email,
            name: u.user_metadata?.name || u.user_metadata?.display_name || u.email?.split('@')[0],
            role: u.user_metadata?.role || (u.email === 'admin@syncarmor.in' ? 'superadmin' : 'admin'),
            status: u.banned_until ? 'suspended' : 'active',
            created_at: u.created_at,
            last_sign_in_at: u.last_sign_in_at || u.created_at,
            is_root: u.email === 'admin@syncarmor.in'
          }));

        // Merge with mockAdmins to guarantee root admins are always present
        const merged = [...mockAdmins];
        adminUsers.forEach(au => {
          if (!merged.some(m => m.email.toLowerCase() === au.email.toLowerCase())) {
            merged.push(au);
          }
        });

        return res.status(200).json({ success: true, admins: merged });
      }
    } catch (e) {
      console.warn('Supabase listUsers note:', e.message);
    }

    return res.status(200).json({ success: true, admins: mockAdmins });
  } catch (err) {
    next(err);
  }
}

export async function createAdminUser(req, res, next) {
  try {
    const { email, password, name, role = 'admin' } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = (name || cleanEmail.split('@')[0]).trim();

    if (mockAdmins.some(a => a.email.toLowerCase() === cleanEmail)) {
      return res.status(400).json({ success: false, message: 'Admin with this email already exists.' });
    }

    let createdId = `admin-${Date.now()}`;
    if (!isMockMode) {
      try {
        const { data, error } = await supabaseAdmin.auth.admin.createUser({
          email: cleanEmail,
          password: password.trim(),
          email_confirm: true,
          user_metadata: {
            is_admin: true,
            name: cleanName,
            role,
          }
        });
        if (error) {
          console.warn('Supabase create user error:', error.message);
        } else if (data?.user) {
          createdId = data.user.id;
        }
      } catch (authErr) {
        console.warn('Supabase admin create exception:', authErr.message);
      }
    }

    const newAdmin = {
      id: createdId,
      email: cleanEmail,
      name: cleanName,
      role,
      status: 'active',
      created_at: new Date().toISOString(),
      last_sign_in_at: null,
      is_root: false,
    };

    mockAdmins.unshift(newAdmin);
    return res.status(201).json({ success: true, admin: newAdmin, message: 'Admin account created successfully.' });
  } catch (err) {
    next(err);
  }
}

export async function updateAdminUser(req, res, next) {
  try {
    const { id } = req.params;
    const { name, role, status } = req.body;

    const adminIndex = mockAdmins.findIndex(a => a.id === id || a.email === id);
    if (adminIndex >= 0) {
      if (name) mockAdmins[adminIndex].name = name.trim();
      if (role) mockAdmins[adminIndex].role = role;
      if (status) mockAdmins[adminIndex].status = status;
    }

    if (!isMockMode) {
      try {
        await supabaseAdmin.auth.admin.updateUserById(id, {
          user_metadata: { name, role, is_admin: true }
        });
      } catch (e) {
        console.warn('Supabase update user note:', e.message);
      }
    }

    const updated = adminIndex >= 0 ? mockAdmins[adminIndex] : { id, name, role, status };
    return res.status(200).json({ success: true, admin: updated });
  } catch (err) {
    next(err);
  }
}

export async function deleteAdminUser(req, res, next) {
  try {
    const { id } = req.params;
    const currentAdminEmail = req.user?.email;

    const target = mockAdmins.find(a => a.id === id || a.email === id);
    if (target?.is_root || target?.email === 'admin@syncarmor.in') {
      return res.status(403).json({ success: false, message: 'Primary root administrator cannot be deleted.' });
    }

    if (target && target.email.toLowerCase() === currentAdminEmail?.toLowerCase()) {
      return res.status(403).json({ success: false, message: 'You cannot delete your own active administrator account.' });
    }

    mockAdmins = mockAdmins.filter(a => a.id !== id && a.email !== id);

    if (!isMockMode) {
      try {
        await supabaseAdmin.auth.admin.deleteUser(id);
      } catch (e) {
        console.warn('Supabase delete user note:', e.message);
      }
    }

    return res.status(200).json({ success: true, message: 'Admin user deleted successfully.' });
  } catch (err) {
    next(err);
  }
}

