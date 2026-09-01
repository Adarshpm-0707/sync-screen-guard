/**
 * Sends styled HTML order notification emails to:
 * 1. Sync Store Admin (syncallfyp@gmail.com) - New purchase alert
 * 2. Customer's Email - Order confirmation with invoice
 * Sender name appears as "Sync Screen Guard" via _name field.
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

  const itemsFormatted = Array.isArray(items) && items.length > 0
    ? items.map((it, idx) =>
        `${idx + 1}. ${it.name || it.product_name || 'Screen Guard'} (Qty: ${it.quantity || 1}) — ₹${(it.price || 0) * (it.quantity || 1)}`
      ).join('<br>')
    : '1x Sync 9H Diamond Tempered Glass';

  const shippingAddress = [address, city, state, pincode].filter(Boolean).join(', ');
  const paymentMethodDisplay = payment_type === 'cod'
    ? 'Cash on Delivery (COD)'
    : 'Prepaid Online (UPI / Card)';
  const dateStr = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

  // ══════════════════════════════════════════════════════════════
  // 1. STORE ADMIN NOTIFICATION EMAIL — syncallfyp@gmail.com
  // ══════════════════════════════════════════════════════════════
  const adminHtml = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f0f4f8;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f4f8;padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.12);">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#1a1a2e 0%,#16213e 60%,#0f3460 100%);padding:36px 40px;text-align:center;">
            <div style="font-size:28px;font-weight:900;letter-spacing:2px;color:#fff;">SYNC</div>
            <div style="font-size:12px;letter-spacing:4px;color:#60a5fa;margin-top:4px;text-transform:uppercase;">Screen Guard</div>
            <div style="margin-top:18px;display:inline-block;background:rgba(52,211,153,0.15);border:1px solid rgba(52,211,153,0.45);border-radius:20px;padding:7px 22px;">
              <span style="color:#6ee7b7;font-size:14px;font-weight:700;">🛍️ New Purchase Order Received</span>
            </div>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="background:#ffffff;padding:36px 40px;">
            <p style="margin:0 0 24px;font-size:15px;color:#374151;">Hello <strong>Sync Team</strong>,<br>A new purchase order has been placed on your store. Here are the full order details:</p>

            <!-- Order ID Banner -->
            <table width="100%" cellpadding="0" cellspacing="0" style="border-radius:10px;background:linear-gradient(135deg,#1e40af,#1d4ed8);margin-bottom:24px;">
              <tr>
                <td style="padding:16px 24px;">
                  <span style="font-size:12px;color:#bfdbfe;letter-spacing:1px;text-transform:uppercase;font-weight:600;">Order Reference</span><br>
                  <span style="font-size:22px;font-weight:900;color:#ffffff;letter-spacing:1px;">#${orderId}</span>
                  &nbsp;&nbsp;
                  <span style="font-size:14px;color:#93c5fd;">${dateStr}</span>
                </td>
              </tr>
            </table>

            <!-- Buyer Info -->
            <table width="100%" cellpadding="0" cellspacing="0" style="border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;margin-bottom:24px;">
              <tr style="background:#f8fafc;">
                <td colspan="2" style="padding:12px 20px;font-size:12px;font-weight:700;letter-spacing:1px;color:#6b7280;text-transform:uppercase;border-bottom:1px solid #e5e7eb;">👤 Buyer / Customer Details</td>
              </tr>
              <tr style="background:#fff;">
                <td style="padding:13px 20px;font-size:13px;color:#6b7280;font-weight:600;width:40%;border-bottom:1px solid #f3f4f6;">Customer Name</td>
                <td style="padding:13px 20px;font-size:14px;color:#111827;font-weight:700;border-bottom:1px solid #f3f4f6;">${customer_name}</td>
              </tr>
              <tr style="background:#f9fafb;">
                <td style="padding:13px 20px;font-size:13px;color:#6b7280;font-weight:600;border-bottom:1px solid #f3f4f6;">📧 Email</td>
                <td style="padding:13px 20px;font-size:14px;color:#2563eb;border-bottom:1px solid #f3f4f6;">${customer_email || 'Not Provided'}</td>
              </tr>
              <tr style="background:#fff;">
                <td style="padding:13px 20px;font-size:13px;color:#6b7280;font-weight:600;">📱 Phone</td>
                <td style="padding:13px 20px;font-size:14px;color:#111827;font-weight:600;">${phone}</td>
              </tr>
            </table>

            <!-- Order Details -->
            <table width="100%" cellpadding="0" cellspacing="0" style="border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;margin-bottom:24px;">
              <tr style="background:#f8fafc;">
                <td colspan="2" style="padding:12px 20px;font-size:12px;font-weight:700;letter-spacing:1px;color:#6b7280;text-transform:uppercase;border-bottom:1px solid #e5e7eb;">📦 Order Details</td>
              </tr>
              <tr style="background:#fff;">
                <td style="padding:13px 20px;font-size:13px;color:#6b7280;font-weight:600;width:40%;border-bottom:1px solid #f3f4f6;">Items Ordered</td>
                <td style="padding:13px 20px;font-size:14px;color:#111827;border-bottom:1px solid #f3f4f6;">${itemsFormatted}</td>
              </tr>
              <tr style="background:#f9fafb;">
                <td style="padding:13px 20px;font-size:13px;color:#6b7280;font-weight:600;border-bottom:1px solid #f3f4f6;">💳 Payment Mode</td>
                <td style="padding:13px 20px;font-size:14px;color:#111827;border-bottom:1px solid #f3f4f6;">${paymentMethodDisplay}</td>
              </tr>
              <tr style="background:#fff;">
                <td style="padding:13px 20px;font-size:13px;color:#6b7280;font-weight:600;border-bottom:1px solid #f3f4f6;">🚚 Delivery Address</td>
                <td style="padding:13px 20px;font-size:14px;color:#111827;border-bottom:1px solid #f3f4f6;">${shippingAddress}</td>
              </tr>
              <tr style="background:#f9fafb;">
                <td style="padding:13px 20px;font-size:13px;color:#6b7280;font-weight:600;">💰 Total Amount</td>
                <td style="padding:13px 20px;font-size:18px;color:#059669;font-weight:900;">₹${total}</td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#1a1a2e;padding:24px 40px;text-align:center;">
            <p style="margin:0;font-size:12px;color:#6b7280;">Process this order promptly for <strong style="color:#93c5fd;">${customer_name}</strong></p>
            <p style="margin:8px 0 0;font-size:11px;color:#4b5563;">© 2025 Sync Screen Guard &nbsp;|&nbsp; syncallfyp@gmail.com &nbsp;|&nbsp; +91 98465 45949</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

  try {
    await fetch('https://formsubmit.co/ajax/syncallfyp@gmail.com', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({
        _subject: `🛍️ PURCHASE ORDER from ${customer_name} — #${orderId} (₹${total})`,
        _name: 'Sync Screen Guard',
        _replyto: customer_email || 'syncallfyp@gmail.com',
        _html: adminHtml,
        _captcha: 'false'
      })
    });
  } catch (err) {
    console.warn('Sync store purchase notification error:', err);
  }

  // ══════════════════════════════════════════════════════════════
  // 2. CUSTOMER CONFIRMATION EMAIL
  // ══════════════════════════════════════════════════════════════
  if (customer_email && customer_email.includes('@')) {
    const customerHtml = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f0f4f8;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f4f8;padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.12);">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#1a1a2e 0%,#16213e 60%,#0f3460 100%);padding:40px;text-align:center;">
            <div style="font-size:28px;font-weight:900;letter-spacing:2px;color:#fff;">SYNC</div>
            <div style="font-size:12px;letter-spacing:4px;color:#60a5fa;margin-top:4px;text-transform:uppercase;">Screen Guard</div>
            <div style="margin-top:20px;font-size:40px;">🎉</div>
            <div style="font-size:22px;font-weight:800;color:#fff;margin-top:8px;">Order Confirmed!</div>
            <div style="margin-top:12px;font-size:14px;color:#93c5fd;">Thank you, <strong>${customer_name}</strong>. Your order is being prepared.</div>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="background:#ffffff;padding:36px 40px;">

            <!-- Order ID Banner -->
            <table width="100%" cellpadding="0" cellspacing="0" style="border-radius:10px;background:linear-gradient(135deg,#059669,#047857);margin-bottom:28px;">
              <tr>
                <td style="padding:18px 24px;text-align:center;">
                  <div style="font-size:12px;color:#a7f3d0;letter-spacing:1px;text-transform:uppercase;font-weight:600;">Your Order ID</div>
                  <div style="font-size:24px;font-weight:900;color:#ffffff;letter-spacing:2px;margin-top:4px;">#${orderId}</div>
                  <div style="font-size:12px;color:#6ee7b7;margin-top:4px;">${dateStr}</div>
                </td>
              </tr>
            </table>

            <!-- Order Summary -->
            <table width="100%" cellpadding="0" cellspacing="0" style="border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;margin-bottom:24px;">
              <tr style="background:#f8fafc;">
                <td colspan="2" style="padding:12px 20px;font-size:12px;font-weight:700;letter-spacing:1px;color:#6b7280;text-transform:uppercase;border-bottom:1px solid #e5e7eb;">📦 Your Order Summary</td>
              </tr>
              <tr style="background:#fff;">
                <td style="padding:13px 20px;font-size:13px;color:#6b7280;font-weight:600;width:45%;border-bottom:1px solid #f3f4f6;">Items Purchased</td>
                <td style="padding:13px 20px;font-size:14px;color:#111827;border-bottom:1px solid #f3f4f6;">${itemsFormatted}</td>
              </tr>
              <tr style="background:#f9fafb;">
                <td style="padding:13px 20px;font-size:13px;color:#6b7280;font-weight:600;border-bottom:1px solid #f3f4f6;">💳 Payment Method</td>
                <td style="padding:13px 20px;font-size:14px;color:#111827;border-bottom:1px solid #f3f4f6;">${paymentMethodDisplay}</td>
              </tr>
              <tr style="background:#fff;">
                <td style="padding:13px 20px;font-size:13px;color:#6b7280;font-weight:600;border-bottom:1px solid #f3f4f6;">🚚 Shipping To</td>
                <td style="padding:13px 20px;font-size:14px;color:#111827;border-bottom:1px solid #f3f4f6;">${shippingAddress}</td>
              </tr>
              <tr style="background:#f9fafb;">
                <td style="padding:13px 20px;font-size:13px;color:#6b7280;font-weight:600;border-bottom:1px solid #f3f4f6;">⏱️ Estimated Delivery</td>
                <td style="padding:13px 20px;font-size:14px;color:#111827;border-bottom:1px solid #f3f4f6;">2 – 4 Business Days</td>
              </tr>
              <tr style="background:#fff;">
                <td style="padding:14px 20px;font-size:13px;color:#6b7280;font-weight:600;">💰 Total Amount</td>
                <td style="padding:14px 20px;font-size:20px;color:#059669;font-weight:900;">₹${total}</td>
              </tr>
            </table>

            <!-- Support Card -->
            <table width="100%" cellpadding="0" cellspacing="0" style="border-radius:12px;background:linear-gradient(135deg,#eff6ff,#dbeafe);border:1px solid #bfdbfe;">
              <tr>
                <td style="padding:20px 24px;">
                  <div style="font-size:13px;font-weight:700;color:#1d4ed8;margin-bottom:8px;">📞 Need Help?</div>
                  <div style="font-size:13px;color:#374151;line-height:1.7;">
                    Email us: <a href="mailto:syncallfyp@gmail.com" style="color:#2563eb;text-decoration:none;font-weight:600;">syncallfyp@gmail.com</a><br>
                    WhatsApp / Call: <strong>+91 98465 45949</strong>
                  </div>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#1a1a2e;padding:24px 40px;text-align:center;">
            <p style="margin:0;font-size:13px;color:#9ca3af;">We're excited to serve you, <strong style="color:#93c5fd;">${customer_name}</strong>!</p>
            <p style="margin:8px 0 0;font-size:11px;color:#4b5563;">© 2025 Sync Screen Guard &nbsp;|&nbsp; syncallfyp@gmail.com &nbsp;|&nbsp; +91 98465 45949</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

    try {
      await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(customer_email.trim())}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          _subject: `🎉 Order Confirmed! — #${orderId} | Sync Screen Guard`,
          _name: 'Sync Screen Guard',
          _replyto: 'syncallfyp@gmail.com',
          _html: customerHtml,
          _captcha: 'false'
        })
      });
    } catch (err) {
      console.warn('Customer order confirmation email error:', err);
    }
  }
}
