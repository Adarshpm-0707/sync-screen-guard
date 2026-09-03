/**
 * Sends structured email notifications for Orders & Cancellations
 * Uses FormSubmit's clean Box template layout to deliver full order details
 * Target Store Inbox: syncallfyp@gmail.com
 */

export async function sendOrderNotificationEmails(orderData) {
  if (!orderData) return;

  const {
    orderId = 'SYNC-' + Date.now(),
    customer_name = 'Customer',
    customer_email = '',
    phone = '',
    address = '',
    city = '',
    state = '',
    pincode = '',
    items = [],
    total = 0,
    payment_type = 'cod',
    cod_fee = 0
  } = orderData;

  const itemsSummaryPlainText = Array.isArray(items) && items.length > 0
    ? items.map((it, idx) =>
        `${idx + 1}. ${it.name || it.product_name || 'Sync Product'} (Qty: ${it.quantity || 1}) — ₹${(it.price || 0) * (it.quantity || 1)}`
      ).join('\n')
    : `1. Sync Premium Product (Qty: 1) — ₹${total}`;

  const shippingAddress = [address, city, state, pincode].filter(Boolean).join(', ') || 'Not Provided';
  const paymentMethodDisplay = payment_type === 'cod'
    ? 'Cash on Delivery (COD)'
    : 'Prepaid Online (UPI / Cards / NetBanking)';
  const dateStr = new Date().toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    dateStyle: 'full',
    timeStyle: 'short'
  });

  // ══════════════════════════════════════════════════════════════
  // 1. STORE ADMIN NOTIFICATION EMAIL — syncallfyp@gmail.com
  // ══════════════════════════════════════════════════════════════
  try {
    await fetch('https://formsubmit.co/ajax/syncallfyp@gmail.com', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        _subject: `🛍️ [NEW ORDER] #${orderId} — ₹${total} (${customer_name})`,
        _template: 'box',
        _captcha: 'false',
        _replyto: customer_email || 'syncallfyp@gmail.com',
        '📦 Order ID': `#${orderId}`,
        '👤 Customer Name': customer_name,
        '📧 Customer Email': customer_email || 'Not Provided',
        '📱 Phone Number': phone || 'Not Provided',
        '💰 Total Order Value': `₹${total}`,
        '💳 Payment Method': paymentMethodDisplay,
        '🚚 Delivery Address': shippingAddress,
        '🛒 Items Purchased': itemsSummaryPlainText,
        '📅 Placed At': dateStr,
        '⚡ Fulfillment Status': 'NEW ORDER — Awaiting Packing & Dispatch',
        '🛡️ Store Channel': 'Sync Store'
      })
    });
  } catch (err) {
    console.warn('Sync store purchase notification error:', err);
  }

  // ══════════════════════════════════════════════════════════════
  // 2. CUSTOMER CONFIRMATION EMAIL
  // ══════════════════════════════════════════════════════════════
  if (customer_email && customer_email.includes('@')) {
    try {
      await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(customer_email.trim())}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          _subject: `🎉 Order Confirmed! #${orderId} | Sync`,
          _template: 'box',
          _captcha: 'false',
          _replyto: 'syncallfyp@gmail.com',
          '📦 Order Reference': `#${orderId}`,
          '👤 Customer Name': customer_name,
          '💰 Total Amount': `₹${total}`,
          '💳 Payment Method': paymentMethodDisplay,
          '🚚 Shipping To': shippingAddress,
          '🛒 Products Ordered': itemsSummaryPlainText,
          '⏱️ Estimated Delivery': '2 – 4 Business Days',
          '📅 Order Date': dateStr,
          '📞 Customer Support': 'Email: syncallfyp@gmail.com | Helpline / WhatsApp: +91 98465 45949',
          '✨ Next Steps': 'Your order has been confirmed. You will receive tracking updates once shipped.'
        })
      });
    } catch (err) {
      console.warn('Customer order confirmation email error:', err);
    }
  }
}

export async function sendOrderCancellationEmails(orderData) {
  if (!orderData) return;

  const orderId = orderData.orderId || orderData.id || ('SYNC-' + Date.now());
  const customer_name = orderData.customer_name || orderData.name || 'Customer';
  const customer_email = orderData.customer_email || orderData.email || '';
  const phone = orderData.phone || '';
  const address = orderData.address || '';
  const city = orderData.city || '';
  const state = orderData.state || '';
  const pincode = orderData.pincode || '';
  const items = orderData.items || [];
  const total = orderData.total || 0;
  const payment_type = orderData.payment_type || 'cod';
  const cancel_reason = orderData.cancel_reason || 'Customer cancellation request';

  const itemsSummaryPlainText = Array.isArray(items) && items.length > 0
    ? items.map((it, idx) =>
        `${idx + 1}. ${it.name || it.product_name || 'Sync Product'} (Qty: ${it.quantity || 1}) — ₹${(it.price || 0) * (it.quantity || 1)}`
      ).join('\n')
    : `1. Sync Premium Product (Qty: 1) — ₹${total}`;

  const shippingAddress = [address, city, state, pincode].filter(Boolean).join(', ') || 'Not Provided';
  const paymentMethodDisplay = payment_type === 'cod'
    ? 'Cash on Delivery (COD)'
    : 'Prepaid Online (UPI / Cards / NetBanking)';
  const dateStr = new Date().toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    dateStyle: 'full',
    timeStyle: 'short'
  });

  // ══════════════════════════════════════════════════════════════
  // 1. STORE ADMIN CANCELLATION EMAIL — syncallfyp@gmail.com
  // ══════════════════════════════════════════════════════════════
  try {
    await fetch('https://formsubmit.co/ajax/syncallfyp@gmail.com', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        _subject: `🚫 [ORDER CANCELLED] #${orderId} — ₹${total} (${customer_name})`,
        _template: 'box',
        _captcha: 'false',
        _replyto: customer_email || 'syncallfyp@gmail.com',
        '🚫 Cancelled Order ID': `#${orderId}`,
        '👤 Customer Name': customer_name,
        '📧 Customer Email': customer_email || 'Not Provided',
        '📱 Phone Number': phone || 'Not Provided',
        '💰 Voided Amount': `₹${total}`,
        '💳 Payment Mode': paymentMethodDisplay,
        '🛒 Cancelled Products': itemsSummaryPlainText,
        '🚚 Destination Address': shippingAddress,
        '❓ Reason for Cancellation': cancel_reason,
        '📅 Cancelled At': dateStr,
        '⚠️ Store Action Notice': 'Stock automatically restored to inventory. Do not hand this parcel over to courier.'
      })
    });
  } catch (err) {
    console.warn('Sync store cancel notification error:', err);
  }

  // ══════════════════════════════════════════════════════════════
  // 2. CUSTOMER CANCELLATION CONFIRMATION EMAIL
  // ══════════════════════════════════════════════════════════════
  if (customer_email && customer_email.includes('@')) {
    try {
      await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(customer_email.trim())}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          _subject: `🚫 Order Cancellation Confirmed — #${orderId} | Sync`,
          _template: 'box',
          _captcha: 'false',
          _replyto: 'syncallfyp@gmail.com',
          '🚫 Cancelled Order Reference': `#${orderId}`,
          '👤 Customer Name': customer_name,
          '💰 Voided Amount': `₹${total}`,
          '💳 Original Payment Mode': paymentMethodDisplay,
          '🛒 Cancelled Items': itemsSummaryPlainText,
          '📅 Cancellation Date': dateStr,
          'ℹ️ Payment & Refund Notice': payment_type === 'cod'
            ? 'Cash on Delivery obligation has been cancelled. No package will be delivered.'
            : 'For online payments, a full refund will be credited to your original payment method within 3–5 business days.',
          '📞 Customer Support': 'Email: syncallfyp@gmail.com | Helpline / WhatsApp: +91 98465 45949'
        })
      });
    } catch (err) {
      console.warn('Customer order cancellation email error:', err);
    }
  }
}
