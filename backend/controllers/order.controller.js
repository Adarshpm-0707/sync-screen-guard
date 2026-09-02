import crypto from 'crypto';
import { supabaseAdmin } from '../supabase.js';
import { mockOrders, mockOrderItems, mockShipments, isMockMode } from '../controllers/admin.controller.js';
import {
  createShiprocketOrder,
  cancelShiprocketOrder,
  orderInFlightPromises,
  orderShiprocketMap
} from '../services/shiprocket.service.js';

// Create a new customer order & automatically sync to Shiprocket
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
      paymentStatus,
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      total,
      codFee,
      items,
      isGuest,
      is_guest,
      userId,
      user_id
    } = req.body;

    // Cryptographic validation for online Razorpay payments if signature is supplied
    let verifiedPaymentStatus = paymentStatus || (paymentMethod === 'cod' ? 'pending' : 'success');
    if (paymentMethod === 'online' && razorpay_order_id && razorpay_payment_id && razorpay_signature) {
      const keySecret = process.env.RAZORPAY_KEY_SECRET;
      if (keySecret && !keySecret.includes('placeholder')) {
        const expectedSig = crypto
          .createHmac('sha256', keySecret)
          .update(`${razorpay_order_id}|${razorpay_payment_id}`)
          .digest('hex');

        if (expectedSig !== razorpay_signature) {
          console.warn('⚠️ [Security Warning] Razorpay payment signature mismatch detected for online order!');
          return res.status(400).json({
            success: false,
            message: 'Payment verification failed: Signature mismatch detected.'
          });
        }
        verifiedPaymentStatus = 'success';
      }
    }

    const guestFlag = isGuest !== undefined ? Boolean(isGuest) : (is_guest !== undefined ? Boolean(is_guest) : !(userId || user_id));
    const effectiveUserId = userId || user_id || null;

    const newOrderId = 'ORD-' + Math.floor(Math.random() * 900000 + 100000);
    const createdAt = new Date().toISOString();

    const orderData = {
      id: newOrderId,
      user_id: effectiveUserId,
      is_guest: guestFlag,
      customer_name: name,
      customer_email: email || '',
      phone: phone,
      address: address,
      city: city,
      state: state,
      pincode: pincode,
      status: 'pending',
      payment_type: paymentMethod || 'cod',
      payment_status: verifiedPaymentStatus,
      razorpay_payment_id: razorpay_payment_id || null,
      razorpay_order_id: razorpay_order_id || null,
      razorpay_signature: razorpay_signature || null,
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

      // Automatically push to Shiprocket in background
      createShiprocketOrder(orderData, items).then(srResult => {
        if (srResult?.success) {
          mockShipments.unshift({
            id: `ship-${Date.now()}`,
            order_id: newOrderId,
            shiprocket_order_id: srResult.shiprocket_order_id,
            awb: srResult.awb,
            status: 'dispatched',
            courier_name: srResult.courier_name || 'Shiprocket Express',
            tracking_url: srResult.tracking_url,
            created_at: new Date().toISOString()
          });
        }
      }).catch(e => console.warn('Background Shiprocket push notice:', e.message));

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
        user_id: effectiveUserId,
        is_guest: guestFlag,
        customer_name: name,
        customer_email: email || null,
        phone: phone,
        address: address,
        city: city,
        state: state,
        pincode: pincode,
        status: 'pending',
        payment_type: paymentMethod || 'cod',
        payment_status: verifiedPaymentStatus,
        razorpay_payment_id: razorpay_payment_id || null,
        razorpay_order_id: razorpay_order_id || null,
        razorpay_signature: razorpay_signature || null,
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

    // 🚀 Automatically push the new order to Shiprocket!
    const pushPromise = createShiprocketOrder(dbOrder, items).then(async (srResult) => {
      if (srResult?.success) {
        try {
          await supabaseAdmin.from('shipments').insert({
            order_id: realOrderId,
            shiprocket_order_id: srResult.shiprocket_order_id,
            awb: srResult.awb,
            status: 'dispatched',
            courier_name: srResult.courier_name || 'Shiprocket Express',
            tracking_url: srResult.tracking_url
          });
          console.log(`🚚 [Shiprocket] Auto-linked shipment for Order #${realOrderId}`);
        } catch (dbShipErr) {
          console.warn('Could not record shipment in Supabase:', dbShipErr.message);
        }
      }
    }).catch(err => {
      console.warn('Automatic Shiprocket order push caught error:', err.message);
    }).finally(() => {
      orderInFlightPromises.delete(String(realOrderId));
    });

    orderInFlightPromises.set(String(realOrderId), pushPromise);

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

// Cancel an order & automatically cancel it in Shiprocket dashboard
export async function cancelOrder(req, res, next) {
  try {
    const { id } = req.params;
    console.log(`\n🚫 [Cancel Order API] Processing customer cancellation for Order #${id}`);

    if (isMockMode) {
      const idx = mockOrders.findIndex(o => o.id === id);
      if (idx !== -1) {
        mockOrders[idx].status = 'cancelled';
      }
      const sIdx = mockShipments.findIndex(s => s.order_id === id);
      if (sIdx !== -1) {
        mockShipments[sIdx].status = 'cancelled';
      }

      // Try cancelling in live Shiprocket if shipment exists
      const mockShipment = mockShipments.find(s => s.order_id === id);
      if (mockShipment?.shiprocket_order_id || mockShipment?.awb) {
        cancelShiprocketOrder({
          orderId: id,
          shiprocketOrderId: mockShipment.shiprocket_order_id,
          awb: mockShipment.awb
        }).catch(e => console.warn('Shiprocket cancellation notice:', e.message));
      }

      return res.status(200).json({
        success: true,
        message: 'Order cancelled successfully and removed from Shiprocket.'
      });
    }

    // Supabase Mode
    // 1. Update order status to cancelled
    const { data: updatedOrder, error: orderErr } = await supabaseAdmin
      .from('orders')
      .update({ status: 'cancelled' })
      .eq('id', id)
      .select()
      .maybeSingle();

    if (orderErr) {
      console.warn('Could not update order status in DB:', orderErr.message);
    }

    // 2. Lookup shipment for this order to get Shiprocket IDs
    const { data: shipment } = await supabaseAdmin
      .from('shipments')
      .select('shiprocket_order_id, awb')
      .eq('order_id', id)
      .maybeSingle();

    // 3. 🚀 Trigger cancellation in Shiprocket Dashboard!
    const srCancelResult = await cancelShiprocketOrder({
      orderId: id,
      shiprocketOrderId: shipment?.shiprocket_order_id,
      awb: shipment?.awb
    });

    // 4. Update shipment status in database
    await supabaseAdmin
      .from('shipments')
      .update({ status: 'cancelled' })
      .eq('order_id', id);

    console.log(`✅ [Cancel Order API] Order #${id} cancelled in DB & Shiprocket:`, srCancelResult);

    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully and removed from Shiprocket.',
      shiprocket: srCancelResult
    });
  } catch (err) {
    console.error('Error in cancelOrder API:', err);
    next(err);
  }
}

// Create a server-side Razorpay Order (official recommended live/production flow)
export async function createRazorpayOrder(req, res, next) {
  try {
    const { amount, currency = 'INR', receipt } = req.body;
    const keyId = process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret || keyId === 'rzp_test_placeholder') {
      return res.status(400).json({
        success: false,
        message: 'Razorpay keys not configured. Please add your live RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env'
      });
    }

    const Razorpay = (await import('razorpay')).default;
    const instance = new Razorpay({
      key_id: keyId,
      key_secret: keySecret
    });

    const options = {
      amount: Math.round(Number(amount) * 100), // in paise
      currency,
      receipt: receipt || `rcpt_${Date.now()}`
    };

    const razorpayOrder = await instance.orders.create(options);
    return res.status(200).json({
      success: true,
      order: razorpayOrder,
      keyId
    });
  } catch (err) {
    console.error('Error in createRazorpayOrder API:', err);
    return res.status(err.statusCode || 500).json({
      success: false,
      error: err.error?.description || err.message || 'Razorpay order creation failed. Please check your credentials.'
    });
  }
}

// Cryptographically verify Razorpay Payment Signature
export async function verifyRazorpayPayment(req, res, next) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keySecret) {
      return res.status(500).json({
        success: false,
        message: 'Razorpay secret key not configured on server.'
      });
    }

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Missing required Razorpay verification parameters.'
      });
    }

    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    const isValid = expectedSignature === razorpay_signature;

    if (isValid) {
      return res.status(200).json({
        success: true,
        verified: true,
        message: 'Payment verified successfully.'
      });
    } else {
      return res.status(400).json({
        success: false,
        verified: false,
        message: 'Invalid payment signature. Verification failed.'
      });
    }
  } catch (err) {
    console.error('Error verifying Razorpay payment:', err);
    next(err);
  }
}
