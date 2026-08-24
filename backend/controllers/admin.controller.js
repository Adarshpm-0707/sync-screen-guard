import { supabaseAdmin } from '../supabase.js';

// Detect mock simulation mode
export const rawUrl = process.env.SUPABASE_URL;
export const isMockMode = !rawUrl || rawUrl.includes('your_supabase_url') || rawUrl.includes('placeholder-url');

// ----------------------------------------------------
// LOCAL IN-MEMORY DATABASE MOCK DATA (for offline/simulated mode)
// ----------------------------------------------------
export let mockOrders = [
  {
    id: 'e27b213a-80fa-4a1d-886c-17f7aa67054a',
    customer_name: 'Adarsh PM',
    customer_email: 'adarshpm0707@gmail.com',
    phone: '9876543210',
    address: 'Flat 402, Sea Breeze Residency, Bandra West',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400050',
    status: 'pending',
    payment_type: 'cod',
    total: 690.00,
    cod_fee: 50.00,
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    payment_status: 'pending'
  },
  {
    id: 'a3c7849e-b7d1-41f2-892a-fa82f2541a7d',
    customer_name: 'Rohan Sharma',
    customer_email: 'rohan@example.com',
    phone: '9123456789',
    address: 'H-45, Green Park Main Area',
    city: 'New Delhi',
    state: 'Delhi',
    pincode: '110016',
    status: 'confirmed',
    payment_type: 'razorpay',
    total: 640.00,
    cod_fee: 0.00,
    created_at: new Date(Date.now() - 3600000 * 25).toISOString(),
    payment_status: 'success'
  },
  {
    id: 'f87b213a-80fa-4a1d-886c-17f7aa67054f',
    customer_name: 'Sneha Patel',
    customer_email: 'sneha@example.com',
    phone: '9822334455',
    address: 'B-704, Shanti Heights, Satellite',
    city: 'Ahmedabad',
    state: 'Gujarat',
    pincode: '380015',
    status: 'delivered',
    payment_type: 'razorpay',
    total: 640.00,
    cod_fee: 0.00,
    created_at: new Date(Date.now() - 3600000 * 50).toISOString(),
    payment_status: 'success'
  }
];

export let mockOrderItems = [
  {
    id: 'item-1',
    order_id: 'e27b213a-80fa-4a1d-886c-17f7aa67054a',
    product_id: 'prod-1',
    product_name: 'Sync EZ Fit Glass Screenguard',
    quantity: 1,
    price: 640.00
  },
  {
    id: 'item-2',
    order_id: 'a3c7849e-b7d1-41f2-892a-fa82f2541a7d',
    product_id: 'prod-1',
    product_name: 'Sync EZ Fit Glass Screenguard',
    quantity: 1,
    price: 640.00
  },
  {
    id: 'item-3',
    order_id: 'f87b213a-80fa-4a1d-886c-17f7aa67054f',
    product_id: 'prod-1',
    product_name: 'Sync EZ Fit Glass Screenguard',
    quantity: 1,
    price: 640.00
  }
];

let mockProducts = [];

let mockShipments = [
  {
    id: 'ship-1',
    order_id: 'f87b213a-80fa-4a1d-886c-17f7aa67054f',
    shiprocket_order_id: 'SR-ORD-928172',
    awb: 'SR-928172654',
    status: 'delivered',
    tracking_url: 'https://shiprocket.co/tracking/SR-928172654',
    eta: new Date(Date.now() - 3600000 * 20).toISOString(),
    courier_name: 'Delhivery',
    created_at: new Date(Date.now() - 3600000 * 48).toISOString()
  }
];

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
        cod_fee: parseFloat(process.env.COD_FEE || 50),
        cod_enabled: true,
        razorpay_key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
      };
    }
    return data;
  } catch (err) {
    return {
      id: 'default',
      cod_fee: 50,
      cod_enabled: true,
      razorpay_key_id: 'rzp_test_placeholder',
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
    const { count: totalOrders } = await supabaseAdmin
      .from('orders')
      .select('*', { count: 'exact', head: true });

    const { count: pendingOrders } = await supabaseAdmin
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const { data: todayOrders } = await supabaseAdmin
      .from('orders')
      .select('total')
      .neq('status', 'cancelled')
      .gte('created_at', startOfToday.toISOString());

    const revenueToday = (todayOrders || []).reduce((acc, curr) => acc + parseFloat(curr.total), 0);

    const { count: codCount } = await supabaseAdmin
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('payment_type', 'cod');

    const { count: prepaidCount } = await supabaseAdmin
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('payment_type', 'razorpay');

    const { data: recentOrders } = await supabaseAdmin
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    const salesHistory = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateString = d.toLocaleDateString();

      const start = new Date(d);
      start.setHours(0, 0, 0, 0);
      const end = new Date(d);
      end.setHours(23, 59, 59, 999);

      const { data: dayOrders } = await supabaseAdmin
        .from('orders')
        .select('total')
        .neq('status', 'cancelled')
        .gte('created_at', start.toISOString())
        .lte('created_at', end.toISOString());

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

    res.status(200).json(updatedOrder);
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

    const { data: shipments, error } = await supabaseAdmin
      .from('shipments')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.status(200).json(shipments);
  } catch (err) {
    next(err);
  }
}

// 9. POST Create shipment (Mocking Shiprocket API push)
export async function createShipment(req, res, next) {
  try {
    const { orderId } = req.body;

    if (isMockMode) {
      const order = mockOrders.find(o => o.id === orderId);
      if (!order) {
        return res.status(404).json({ message: 'Order not found.' });
      }
      
      const awb = `SR-${Math.floor(100000000 + Math.random() * 900000000)}`;
      const trackingUrl = `https://shiprocket.co/tracking/${awb}`;
      const etaDate = new Date();
      etaDate.setDate(etaDate.getDate() + 4);

      const shipment = {
        id: `ship-${Date.now()}`,
        order_id: orderId,
        shiprocket_order_id: `SR-ORD-${Math.floor(100000 + Math.random() * 900000)}`,
        awb,
        status: 'dispatched',
        tracking_url: trackingUrl,
        eta: etaDate.toISOString(),
        courier_name: 'Express Bees',
        created_at: new Date().toISOString()
      };

      mockShipments.unshift(shipment);

      // Update mock order status
      const oIdx = mockOrders.findIndex(o => o.id === orderId);
      if (oIdx !== -1) {
        mockOrders[oIdx].status = 'shipped';
      }

      return res.status(201).json(shipment);
    }

    const { data: order, error: orderErr } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (orderErr || !order) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    const awb = `SR-${Math.floor(100000000 + Math.random() * 900000000)}`;
    const trackingUrl = `https://shiprocket.co/tracking/${awb}`;
    
    const { data: shipment, error } = await supabaseAdmin
      .from('shipments')
      .insert({
        order_id: orderId,
        shiprocket_order_id: `SR-ORD-${Math.floor(100000 + Math.random() * 900000)}`,
        awb,
        status: 'dispatched',
        tracking_url: trackingUrl,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    await supabaseAdmin
      .from('orders')
      .update({ status: 'shipped' })
      .eq('id', orderId);

    res.status(201).json(shipment);
  } catch (err) {
    next(err);
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
