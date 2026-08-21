import { supabaseAdmin } from '../supabase.js';
import { mockOrders, mockOrderItems, isMockMode } from '../controllers/admin.controller.js';

// Create a new customer order
export async function createOrder(req, res, next) {
  try {
    const {
      name,
      email,
      phone,
      address,
      city,
      state,
      pincode,
      paymentMethod,
      total,
      codFee,
      items
    } = req.body;

    const newOrderId = 'ORD-' + Math.floor(Math.random() * 900000 + 100000);
    const createdAt = new Date().toISOString();

    const orderData = {
      id: newOrderId,
      customer_name: name,
      customer_email: email || '',
      phone: phone,
      address: address,
      city: city,
      state: state,
      pincode: pincode,
      status: 'pending',
      payment_type: paymentMethod || 'cod',
      payment_status: paymentMethod === 'cod' ? 'pending' : 'success',
      total: parseFloat(total),
      cod_fee: parseFloat(codFee || 0),
      created_at: createdAt
    };

    if (isMockMode) {
      mockOrders.unshift(orderData);
      
      if (Array.isArray(items)) {
        items.forEach((item, index) => {
          mockOrderItems.unshift({
            id: `item-${Date.now()}-${index}`,
            order_id: newOrderId,
            product_id: item.id,
            product_name: item.name,
            quantity: item.quantity,
            price: item.price
          });
        });
      }

      return res.status(201).json({
        success: true,
        orderId: newOrderId,
        order: orderData
      });
    }

    // Supabase Mode
    const { data: dbOrder, error: orderErr } = await supabaseAdmin
      .from('orders')
      .insert({
        customer_name: name,
        customer_email: email || null,
        phone: phone,
        address: address,
        city: city,
        state: state,
        pincode: pincode,
        status: 'pending',
        payment_type: paymentMethod || 'cod',
        payment_status: paymentMethod === 'cod' ? 'pending' : 'success',
        total: parseFloat(total),
        cod_fee: parseFloat(codFee || 0)
      })
      .select()
      .single();

    if (orderErr) throw orderErr;

    const realOrderId = dbOrder.id;

    if (Array.isArray(items) && items.length > 0) {
      const orderItemsData = items.map(item => ({
        order_id: realOrderId,
        product_id: item.id && item.id.length === 36 ? item.id : null,
        product_name: item.name,
        quantity: item.quantity,
        price: item.price
      }));

      await supabaseAdmin.from('order_items').insert(orderItemsData);
    }

    res.status(201).json({
      success: true,
      orderId: realOrderId,
      order: dbOrder
    });
  } catch (err) {
    console.error('Error in createOrder API:', err);
    next(err);
  }
}
