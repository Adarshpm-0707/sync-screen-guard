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
      const { data: dbOrders, error } = await supabaseAdmin
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

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

