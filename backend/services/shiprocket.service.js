import { supabaseAdmin } from '../supabase.js';

let cachedToken = null;
let tokenExpiresAt = null;

// High-speed in-memory caches to eliminate race conditions between order creation and cancellation
export const orderShiprocketMap = new Map();
export const orderInFlightPromises = new Map();

/**
 * Obtain or reuse a valid Shiprocket JWT Bearer token.
 * Full debug logging so failures are visible in the server console.
 */
export async function getShiprocketToken() {
  const email = process.env.SHIPROCKET_EMAIL?.trim();
  const password = process.env.SHIPROCKET_PASSWORD?.trim();

  if (!email || !password || email.includes('your_shiprocket') || email.includes('placeholder')) {
    console.warn('⚠️ [Shiprocket] Credentials missing or placeholder in .env. Skipping.');
    return null;
  }

  console.log(`🔐 [Shiprocket] Authenticating with email: ${email}`);

  // Reuse cached token if still valid
  if (cachedToken && tokenExpiresAt && Date.now() < tokenExpiresAt) {
    console.log('🔐 [Shiprocket] Reusing cached token.');
    return cachedToken;
  }

  try {
    const response = await fetch('https://apiv2.shiprocket.in/v1/external/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();
    console.log(`🔐 [Shiprocket] Auth response status: ${response.status}`, JSON.stringify(data).slice(0, 300));

    if (response.ok && data.token) {
      cachedToken = data.token;
      tokenExpiresAt = Date.now() + 8 * 24 * 60 * 60 * 1000;
      console.log('✅ [Shiprocket] Authenticated successfully. Token cached (first 40 chars):', data.token.slice(0, 40));
      return cachedToken;
    } else {
      console.error('❌ [Shiprocket] Authentication FAILED:', JSON.stringify(data));
      return null;
    }
  } catch (err) {
    console.error('❌ [Shiprocket] Network error during auth:', err.message);
    return null;
  }
}

/**
 * Maps Shiprocket statuses to internal Sync Order & Shipment statuses
 */
export function mapShiprocketStatus(srStatus) {
  if (!srStatus) return { orderStatus: 'confirmed', shipmentStatus: 'dispatched' };
  const s = String(srStatus).toUpperCase();

  if (s.includes('DELIVERED') && !s.includes('RTO')) {
    return { orderStatus: 'delivered', shipmentStatus: 'delivered' };
  }
  if (s.includes('OUT FOR DELIVERY') || s.includes('IN TRANSIT') || s.includes('PICKED UP') || s.includes('SHIPPED') || s.includes('REACHED')) {
    return { orderStatus: 'shipped', shipmentStatus: 'in_transit' };
  }
  if (s.includes('CANCEL') || s.includes('RTO')) {
    return { orderStatus: 'cancelled', shipmentStatus: 'cancelled' };
  }
  if (s.includes('MANIFEST') || s.includes('READY') || s.includes('PICKUP SCHEDULED') || s.includes('AWB ASSIGNED')) {
    return { orderStatus: 'confirmed', shipmentStatus: 'dispatched' };
  }
  return { orderStatus: 'confirmed', shipmentStatus: 'pending' };
}

/**
 * Automatically create an Adhoc Order on Shiprocket dashboard
 */
export async function createShiprocketOrder(order, items = []) {
  try {
    console.log(`\n📦 [Shiprocket] Starting order push for Order #${order.id || 'UNKNOWN'}...`);

    const token = await getShiprocketToken();
    if (!token) {
      console.warn('⚠️ [Shiprocket] No valid token — aborting order push.');
      return { success: false, reason: 'No Shiprocket token' };
    }

    const customerName = (order.customer_name || 'Customer').trim();
    const nameParts = customerName.split(' ');
    const firstName = nameParts[0] || 'Customer';
    const lastName = nameParts.slice(1).join(' ') || '.';

    const orderIdStr = String(order.id || `SYNC-${Date.now()}`);
    // Shiprocket requires date as YYYY-MM-DD HH:mm
    const orderDateStr = new Date(order.created_at || Date.now())
      .toISOString()
      .slice(0, 19)
      .replace('T', ' ');

    const orderItems = Array.isArray(items) && items.length > 0
      ? items.map((it, idx) => ({
          name: (it.name || it.product_name || 'Sync Screen Guard 9H Glass').slice(0, 100),
          sku: `SYNC-${String(it.product_id || it.id || idx).slice(0, 8).toUpperCase().replace(/-/g, '')}`,
          units: Math.max(1, Number(it.quantity) || 1),
          selling_price: Number(it.price) || 299,
          discount: 0,
          tax: 0,
          hsn: 7007
        }))
      : [{
          name: 'Sync 9H Diamond Tempered Glass',
          sku: 'SYNC-SG-001',
          units: 1,
          selling_price: Number(order.total) || 299,
          discount: 0,
          tax: 0,
          hsn: 7007
        }];

    const isCod = String(order.payment_type || '').toLowerCase() === 'cod';
    const paymentMethod = isCod ? 'COD' : 'Prepaid';
    const phone = String(order.phone || '9846545949').replace(/\D/g, '').slice(-10);

    const payload = {
      order_id: orderIdStr,
      order_date: orderDateStr,
      pickup_location: process.env.SHIPROCKET_PICKUP_LOCATION || 'Primary',
      channel_id: process.env.SHIPROCKET_CHANNEL_ID ? String(process.env.SHIPROCKET_CHANNEL_ID) : undefined,
      comment: 'Sync Screen Guard - Auto Order Sync',
      billing_customer_name: firstName,
      billing_last_name: lastName,
      billing_address: (order.address || 'Standard Address').slice(0, 200),
      billing_address_2: '',
      billing_city: order.city || 'Kannur',
      billing_pincode: String(order.pincode || '670001').replace(/\D/g, ''),
      billing_state: order.state || 'Kerala',
      billing_country: 'India',
      billing_email: order.customer_email || 'syncallfyp@gmail.com',
      billing_phone: phone,
      shipping_is_billing: true,
      order_items: orderItems,
      payment_method: paymentMethod,
      shipping_charges: 0,
      giftwrap_charges: 0,
      transaction_charges: 0,
      total_discount: 0,
      sub_total: Number(order.total) || 299,
      length: 18,
      breadth: 10,
      height: 2,
      weight: 0.15
    };

    // Remove undefined channel_id to avoid API rejection
    if (!payload.channel_id) delete payload.channel_id;

    console.log(`📦 [Shiprocket] Sending payload to Shiprocket API:`, JSON.stringify(payload, null, 2));

    const response = await fetch('https://apiv2.shiprocket.in/v1/external/orders/create/adhoc', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    console.log(`📦 [Shiprocket] Order create response (${response.status}):`, JSON.stringify(data).slice(0, 500));

    if (response.ok && (data.order_id || data.shipment_id)) {
      const awb = data.awb_code || null;
      const trackingUrl = awb ? `https://shiprocket.co/tracking/${awb}` : `https://app.shiprocket.in/orders/processing`;
      const srOrderIdStr = String(data.order_id || '');

      console.log(`✅ [Shiprocket] Order #${orderIdStr} created! SR Order ID: ${data.order_id}, Shipment ID: ${data.shipment_id}, AWB: ${awb}`);

      // Cache mapping for instant zero-latency cancellation
      if (srOrderIdStr) {
        orderShiprocketMap.set(String(order.id), srOrderIdStr);
        orderShiprocketMap.set(String(orderIdStr), srOrderIdStr);
      }

      // Update orders table with shiprocket_order_id in background
      if (order.id && srOrderIdStr) {
        supabaseAdmin
          .from('orders')
          .update({ shiprocket_order_id: srOrderIdStr })
          .eq('id', order.id)
          .then(() => console.log(`💾 [Shiprocket] Saved SR Order ID #${srOrderIdStr} directly to Order #${order.id}`))
          .catch(e => console.warn('Could not save SR ID to orders table:', e.message));
      }

      return {
        success: true,
        shiprocket_order_id: srOrderIdStr,
        shipment_id: String(data.shipment_id || ''),
        awb: awb || `SR-${data.order_id || Date.now()}`,
        status: data.status || 'NEW',
        tracking_url: trackingUrl,
        courier_name: data.courier_name || 'Shiprocket Express',
        raw: data
      };
    } else {
      console.error(`❌ [Shiprocket] Order creation FAILED (${response.status}):`, JSON.stringify(data));
      return {
        success: false,
        error: data.message || data.errors || 'Shiprocket API rejected the order',
        status_code: response.status,
        raw: data
      };
    }
  } catch (err) {
    console.error('❌ [Shiprocket] Exception in createShiprocketOrder:', err.message, err.stack);
    return { success: false, error: err.message };
  }
}

/**
 * Assign AWB & Request Pickup from Shiprocket
 */
export async function assignAWBAndRequestPickup(shipmentId, courierId = null) {
  try {
    const token = await getShiprocketToken();
    if (!token || !shipmentId) return { success: false, reason: 'Missing token or shipmentId' };

    console.log(`📦 [Shiprocket] Assigning AWB for shipment ID: ${shipmentId}`);

    const awbPayload = { shipment_id: [Number(shipmentId)] };
    if (courierId) awbPayload.courier_id = courierId;

    const awbRes = await fetch('https://apiv2.shiprocket.in/v1/external/courier/assign/awb', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(awbPayload)
    });

    const awbData = await awbRes.json();
    console.log(`📦 [Shiprocket] AWB Assignment (${awbRes.status}):`, JSON.stringify(awbData).slice(0, 300));

    // Request Pickup
    const pickupRes = await fetch('https://apiv2.shiprocket.in/v1/external/courier/generate/pickup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ shipment_id: [Number(shipmentId)] })
    });

    const pickupData = await pickupRes.json();
    console.log(`📦 [Shiprocket] Pickup request (${pickupRes.status}):`, JSON.stringify(pickupData).slice(0, 200));

    const awbCode = awbData?.response?.data?.awb_code
      || awbData?.data?.awb_code
      || awbData?.awb_code
      || null;
    const courierName = awbData?.response?.data?.courier_name
      || awbData?.data?.courier_name
      || 'Shiprocket Express';

    return { success: true, awb_code: awbCode, courier_name: courierName, awbData, pickupData };
  } catch (err) {
    console.error('❌ [Shiprocket] Error assigning AWB/Pickup:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Track a shipment by AWB or Shipment ID from Shiprocket
 */
export async function trackShiprocketShipment(awbOrShipmentId) {
  try {
    const token = await getShiprocketToken();
    if (!token || !awbOrShipmentId) return null;

    const res = await fetch(`https://apiv2.shiprocket.in/v1/external/courier/track/awb/${encodeURIComponent(awbOrShipmentId)}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const data = await res.json();

    if (data?.tracking_data?.track_status === 1 || data?.tracking_data?.shipment_track) {
      const track = Array.isArray(data.tracking_data.shipment_track)
        ? data.tracking_data.shipment_track[0]
        : data.tracking_data.shipment_track || {};

      const currentStatus = track.current_status || track.status || 'IN TRANSIT';
      const courier = track.courier_name || 'Shiprocket Express';
      const eta = track.edd || track.expected_date || null;
      const awb = track.awb_code || awbOrShipmentId;
      const activities = Array.isArray(data.tracking_data.shipment_track_activities)
        ? data.tracking_data.shipment_track_activities
        : [];

      const { orderStatus, shipmentStatus } = mapShiprocketStatus(currentStatus);

      return {
        success: true, current_status: currentStatus, orderStatus, shipmentStatus,
        courier_name: courier, awb, eta,
        tracking_url: `https://shiprocket.co/tracking/${awb}`,
        activities, raw: data
      };
    }

    return null;
  } catch (err) {
    console.warn(`⚠️ [Shiprocket] Tracking check failed for ${awbOrShipmentId}:`, err.message);
    return null;
  }
}

/**
 * Synchronize all active shipments statuses from Shiprocket
 */
export async function syncAllShipmentStatuses() {
  try {
    const { data: activeShipments, error } = await supabaseAdmin
      .from('shipments')
      .select('*')
      .neq('status', 'delivered')
      .neq('status', 'cancelled');

    if (error || !activeShipments || activeShipments.length === 0) {
      return { synced: 0, message: 'No active pending shipments to sync' };
    }

    let updatedCount = 0;
    for (const sh of activeShipments) {
      const trackKey = sh.awb || sh.shiprocket_order_id;
      if (!trackKey || trackKey.startsWith('SR-') === false && trackKey.length < 5) continue;

      const trackInfo = await trackShiprocketShipment(trackKey);
      if (trackInfo && trackInfo.current_status) {
        await supabaseAdmin.from('shipments')
          .update({
            status: trackInfo.shipmentStatus,
            courier_name: trackInfo.courier_name,
            awb: trackInfo.awb || sh.awb,
            tracking_url: trackInfo.tracking_url
          })
          .eq('id', sh.id);

        if (sh.order_id && trackInfo.orderStatus) {
          await supabaseAdmin.from('orders')
            .update({ status: trackInfo.orderStatus })
            .eq('id', sh.order_id);
        }
        updatedCount++;
      }
    }

    console.log(`🔄 [Shiprocket] Synchronized ${updatedCount} shipments.`);
    return { synced: updatedCount, totalChecked: activeShipments.length };
  } catch (err) {
    console.error('❌ [Shiprocket] Sync error:', err);
    return { error: err.message };
  }
}

/**
 * Handle incoming real-time Webhook from Shiprocket
 */
export async function handleShiprocketWebhook(body) {
  try {
    console.log('📬 [Shiprocket Webhook] Received:', JSON.stringify(body).slice(0, 500));

    const orderId = body.order_id || body.channel_order_id;
    const awb = body.awb || body.awb_code;
    const currentStatus = body.current_status || body.status;
    const courier = body.courier_name || 'Shiprocket Express';

    if (!orderId && !awb) {
      return { success: false, message: 'Missing order_id or awb in webhook payload' };
    }

    const { orderStatus, shipmentStatus } = mapShiprocketStatus(currentStatus);

    // Update orders table
    if (orderId) {
      await supabaseAdmin.from('orders')
        .update({ status: orderStatus })
        .or(`id.eq.${orderId},id.ilike.%${orderId}%`);
    }

    // Update shipments table
    const updateData = { status: shipmentStatus, courier_name: courier };
    if (awb) {
      updateData.awb = awb;
      updateData.tracking_url = `https://shiprocket.co/tracking/${awb}`;
    }

    if (orderId) {
      await supabaseAdmin.from('shipments').update(updateData)
        .or(`order_id.eq.${orderId},shiprocket_order_id.eq.${orderId}`);
    } else if (awb) {
      await supabaseAdmin.from('shipments').update(updateData).eq('awb', awb);
    }

    console.log(`✅ [Shiprocket Webhook] Updated → Order: ${orderStatus}, Shipment: ${shipmentStatus}`);
    return { success: true, orderStatus, shipmentStatus };
  } catch (err) {
    console.error('❌ [Shiprocket Webhook] Error:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Automatically cancel/remove an order from the Shiprocket dashboard
 * Multi-tier guaranteed lookup:
 * 1. Wait for in-flight creation promise if pending
 * 2. In-memory cache
 * 3. orders table (shiprocket_order_id)
 * 4. shipments table (shiprocket_order_id, awb)
 * 5. Shiprocket search API (?search=)
 * 6. Shiprocket recent orders scan (?per_page=50)
 */
export async function cancelShiprocketOrder({ orderId, shiprocketOrderId, awb }) {
  try {
    console.log(`\n🚫 [Shiprocket Cancel] Initiating cancellation for Order #${orderId || 'UNKNOWN'}...`, {
      shiprocketOrderId,
      awb
    });

    const token = await getShiprocketToken();
    if (!token) {
      console.warn('⚠️ [Shiprocket Cancel] Token unavailable. Skipping Shiprocket cancel API.');
      return { success: false, reason: 'No token' };
    }

    let srIds = [];
    let awbsToCancel = [];
    const cleanOrderId = orderId ? String(orderId).trim() : '';

    if (awb && !awb.startsWith('SR-ORD-') && awb.length > 5) {
      awbsToCancel.push(awb);
    }

    // Tier 0: Wait for in-flight push if order was created just a second ago
    if (cleanOrderId && orderInFlightPromises.has(cleanOrderId)) {
      console.log(`⏳ [Shiprocket Cancel] Order #${cleanOrderId} creation is in-flight. Waiting for it to finish...`);
      try {
        await Promise.race([
          orderInFlightPromises.get(cleanOrderId),
          new Promise(resolve => setTimeout(resolve, 3500))
        ]);
      } catch (e) {}
    }

    // Tier 1: Explicit parameter
    if (shiprocketOrderId) {
      const numId = Number(shiprocketOrderId);
      if (!isNaN(numId) && numId > 0) {
        srIds.push(numId);
      }
    }

    // Tier 2: In-memory cache
    if (srIds.length === 0 && cleanOrderId && orderShiprocketMap.has(cleanOrderId)) {
      const cached = Number(orderShiprocketMap.get(cleanOrderId));
      if (!isNaN(cached) && cached > 0) {
        srIds.push(cached);
        console.log(`⚡ [Shiprocket Cancel] Found Shiprocket Order ID via memory cache: ${cached}`);
      }
    }

    // Tier 3: Supabase orders table
    if (srIds.length === 0 && cleanOrderId) {
      try {
        const { data: ordRow } = await supabaseAdmin
          .from('orders')
          .select('shiprocket_order_id')
          .eq('id', cleanOrderId)
          .maybeSingle();

        if (ordRow?.shiprocket_order_id) {
          const num = Number(ordRow.shiprocket_order_id);
          if (!isNaN(num) && num > 0 && !srIds.includes(num)) {
            srIds.push(num);
            console.log(`💾 [Shiprocket Cancel] Found Shiprocket Order ID in orders table: ${num}`);
          }
        }
      } catch (e) {}
    }

    // Tier 4: Supabase shipments table
    if (cleanOrderId) {
      try {
        const { data: shipments } = await supabaseAdmin
          .from('shipments')
          .select('shiprocket_order_id, awb')
          .or(`order_id.eq.${cleanOrderId},shiprocket_order_id.eq.${cleanOrderId}`);

        if (Array.isArray(shipments) && shipments.length > 0) {
          for (const sh of shipments) {
            if (sh.shiprocket_order_id) {
              const num = Number(sh.shiprocket_order_id);
              if (!isNaN(num) && num > 0 && !srIds.includes(num)) {
                srIds.push(num);
                console.log(`💾 [Shiprocket Cancel] Found Shiprocket Order ID in shipments table: ${num}`);
              }
            }
            if (sh.awb && !sh.awb.startsWith('SR-ORD-') && !awbsToCancel.includes(sh.awb)) {
              awbsToCancel.push(sh.awb);
            }
          }
        }
      } catch (e) {}
    }

    // Tier 5: Search Shiprocket API by order_id
    if (srIds.length === 0 && cleanOrderId) {
      try {
        console.log(`🔍 [Shiprocket Cancel] Searching Shiprocket API for: ${cleanOrderId}...`);
        const searchRes = await fetch(`https://apiv2.shiprocket.in/v1/external/orders?search=${encodeURIComponent(cleanOrderId)}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const searchData = await searchRes.json();

        if (Array.isArray(searchData?.data)) {
          for (const ord of searchData.data) {
            const isMatch = ord.channel_order_id === cleanOrderId ||
              String(ord.id) === cleanOrderId ||
              String(ord.order_id) === cleanOrderId ||
              cleanOrderId.includes(String(ord.channel_order_id || '---'));

            if (isMatch && ord.id && !srIds.includes(ord.id)) {
              srIds.push(ord.id);
              console.log(`🎯 [Shiprocket Cancel] Found via search: ${ord.id} (${ord.channel_order_id})`);
            }
            if (ord.awb_code && !awbsToCancel.includes(ord.awb_code)) {
              awbsToCancel.push(ord.awb_code);
            }
          }
        }
      } catch (e) {}
    }

    // Tier 6: Scan recent orders in Shiprocket (first 50)
    if (srIds.length === 0 && cleanOrderId) {
      try {
        console.log(`📋 [Shiprocket Cancel] Scanning recent Shiprocket orders list for match...`);
        const listRes = await fetch(`https://apiv2.shiprocket.in/v1/external/orders?per_page=50`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const listData = await listRes.json();

        if (Array.isArray(listData?.data)) {
          for (const ord of listData.data) {
            const isMatch = ord.channel_order_id === cleanOrderId ||
              String(ord.id) === cleanOrderId ||
              cleanOrderId.includes(String(ord.channel_order_id || '---'));

            if (isMatch && ord.id && !srIds.includes(ord.id)) {
              srIds.push(ord.id);
              console.log(`🎯 [Shiprocket Cancel] Found via recent list scan: ${ord.id}`);
            }
          }
        }
      } catch (e) {}
    }

    let cancelSuccess = false;
    let cancelResponse = null;

    // 🚀 Execute Order Cancellation in Shiprocket
    if (srIds.length > 0) {
      console.log(`🚫 [Shiprocket Cancel] Sending cancel request for Shiprocket Order IDs:`, srIds);
      const cancelRes = await fetch('https://apiv2.shiprocket.in/v1/external/orders/cancel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ids: srIds })
      });

      cancelResponse = await cancelRes.json();
      console.log(`🚫 [Shiprocket Cancel] Cancel API response (${cancelRes.status}):`, JSON.stringify(cancelResponse));

      if (cancelRes.ok || cancelResponse.status_code === 200) {
        cancelSuccess = true;
      }
    } else {
      console.warn(`⚠️ [Shiprocket Cancel] No matching Shiprocket order ID found for Order #${cleanOrderId}`);
    }

    // 🚀 Execute AWB / Shipment Cancellation if applicable
    if (awbsToCancel.length > 0) {
      console.log(`🚫 [Shiprocket Cancel] Sending cancel request for AWBs:`, awbsToCancel);
      try {
        const awbCancelRes = await fetch('https://apiv2.shiprocket.in/v1/external/orders/cancel/shipment/awbs', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ awbs: awbsToCancel })
        });
        const awbData = await awbCancelRes.json();
        console.log(`🚫 [Shiprocket Cancel] AWB Cancel response:`, JSON.stringify(awbData));
      } catch (e) {}
    }

    // 💾 Update status in Supabase
    if (cleanOrderId) {
      try {
        await supabaseAdmin
          .from('shipments')
          .update({ status: 'cancelled' })
          .or(`order_id.eq.${cleanOrderId},shiprocket_order_id.eq.${cleanOrderId}`);

        await supabaseAdmin
          .from('orders')
          .update({ status: 'cancelled' })
          .eq('id', cleanOrderId);
      } catch (e) {}
    }

    console.log(`✅ [Shiprocket Cancel] Order #${cleanOrderId} cancellation finished! Status: ${cancelSuccess ? 'CANCELLED IN SHIPROCKET' : 'NOT FOUND IN SR'}`);
    return {
      success: true,
      shiprocketCancelled: cancelSuccess,
      cancelledIds: srIds,
      response: cancelResponse
    };
  } catch (err) {
    console.error('❌ [Shiprocket Cancel] Error cancelling order on Shiprocket:', err.message);
    return { success: false, error: err.message };
  }
}



