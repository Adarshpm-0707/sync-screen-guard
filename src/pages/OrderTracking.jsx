import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  Search, CheckCircle, Package, Clock, ShieldCheck, 
  ArrowLeft, ChevronRight, Truck, MapPin, AlertCircle, XCircle, User, LogIn 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../supabaseClient';
import { restoreStockForCancelledOrder } from '../utils/stockManager';
import useCustomerAuth from '../hooks/useCustomerAuth';

export default function OrderTracking() {
  const [searchParams] = useSearchParams();
  const { customer, isLoggedIn, openAuthModal } = useCustomerAuth();
  const [orderId, setOrderId] = useState('');
  const [trackingData, setTrackingData] = useState(null);
  const [customerOrders, setCustomerOrders] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [now, setNow] = useState(Date.now());

  // 1-second ticker to dynamically manage 10-minute cancellation countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const normalizeOrderItems = (order) => {
    let items = order.items;
    if ((!items || items.length === 0) && order.order_items && Array.isArray(order.order_items)) {
      items = order.order_items.map(oi => ({
        id: oi.product_id || oi.id,
        name: oi.product_name || oi.name || 'Sync Armor Screen Protector',
        quantity: oi.quantity || 1,
        price: oi.price || 0,
        image: oi.image || oi.product_image || null,
        selectedModel: oi.model || oi.device_model || null
      }));
    }
    return { ...order, items: items || [] };
  };

  // Fetch only this customer's orders if logged in
  useEffect(() => {
    if (isLoggedIn && customer) {
      fetchCustomerOrders();
    } else {
      setCustomerOrders([]);
      setTrackingData(null);
      setOrdersLoading(false);
    }
  }, [isLoggedIn, customer]);

  // Handle URL query param for direct order lookup
  useEffect(() => {
    const urlOrderId = searchParams.get('orderId');
    if (urlOrderId) {
      setOrderId(urlOrderId);
      handleTrack(urlOrderId);
    }
  }, [searchParams]);

  const fetchCustomerOrders = async () => {
    setOrdersLoading(true);
    try {
      const userId = customer?.id;
      const userEmail = customer?.email?.trim().toLowerCase();

      if (!userId && !userEmail) {
        setCustomerOrders([]);
        setTrackingData(null);
        setOrdersLoading(false);
        return;
      }

      let orders = [];

      // 1. Try Supabase first — fetch orders matching strictly this user or email
      try {
        let query = supabase.from('orders').select('*, order_items(*)');
        
        if (userId && !userId.startsWith('guest-') && userEmail) {
          query = query.or(`user_id.eq.${userId},customer_email.ilike.${userEmail}`);
        } else if (userId && !userId.startsWith('guest-')) {
          query = query.eq('user_id', userId);
        } else if (userEmail) {
          query = query.ilike('customer_email', userEmail);
        }

        const { data, error: sbErr } = await query.order('created_at', { ascending: false });
        if (!sbErr && data && data.length > 0) {
          // Strictly filter to ensure no cross-customer leakage
          orders = data.filter(o => {
            const matchesUser = userId && !userId.startsWith('guest-') && o.user_id === userId;
            const matchesEmail = userEmail && o.customer_email && o.customer_email.trim().toLowerCase() === userEmail;
            return matchesUser || matchesEmail;
          });
        }
      } catch (e) {
        console.warn('Supabase order fetch failed, falling back to local:', e);
      }

      // 2. Merge with localStorage orders strictly belonging to this customer
      try {
        const allLocal = JSON.parse(localStorage.getItem('customer_orders') || '[]');
        const myLocal = allLocal.filter(o => {
          const matchesUser = userId && !userId.startsWith('guest-') && o.user_id === userId;
          const matchesEmail = userEmail && o.customer_email && o.customer_email.trim().toLowerCase() === userEmail;
          return matchesUser || matchesEmail;
        });

        const existingIds = new Set(orders.map(o => o.id));
        for (const lo of myLocal) {
          if (!existingIds.has(lo.id)) {
            orders.push(lo);
          }
        }
      } catch (e) {}

      orders = orders.map(normalizeOrderItems);
      orders.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
      setCustomerOrders(orders);

      if (orders.length > 0 && !searchParams.get('orderId')) {
        setOrderId(orders[0].id);
        buildTrackingView(orders[0]);
      } else if (orders.length === 0) {
        setTrackingData(null);
      }
    } catch (e) {
      console.error('Error fetching customer orders:', e);
    }
    setOrdersLoading(false);
  };

  const buildTrackingView = (orderObj) => {
    const statusMap = {
      pending: { label: 'Order Placed', progress: 1 },
      confirmed: { label: 'Order Confirmed', progress: 2 },
      processing: { label: 'Packed & Quality Checked', progress: 3 },
      shipped: { label: 'In Transit / Dispatched', progress: 4 },
      delivered: { label: 'Delivered', progress: 5 },
      cancelled: { label: 'Order Cancelled', progress: 0 },
    };

    const statusInfo = statusMap[orderObj.status] || { label: orderObj.status || 'Order Placed', progress: 2 };
    const dateStr = new Date(orderObj.created_at || Date.now()).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric'
    });

    const normalized = normalizeOrderItems(orderObj);

    setTrackingData({
      ...normalized,
      statusLabel: statusInfo.label,
      progress: statusInfo.progress,
      milestones: [
        { label: 'Order Placed', desc: 'Received & logged in Sync warehouse system', date: dateStr, completed: statusInfo.progress >= 1 },
        { label: 'Order Confirmed', desc: 'Inventory allocated and packed with applicator tray', date: dateStr, completed: statusInfo.progress >= 2 },
        { label: 'Quality Calibration', desc: '9H Glass & oleophobic coating inspected', date: 'Sync OK', completed: statusInfo.progress >= 3 },
        { label: 'Dispatched with Courier', desc: 'Handed over to express courier partner', date: 'In Transit', completed: statusInfo.progress >= 4 },
        { label: 'Delivered at Doorstep', desc: 'Safe delivery at destination address', date: 'Pending', completed: statusInfo.progress >= 5 },
      ]
    });
  };

  const handleTrack = async (targetQuery) => {
    const queryStr = (targetQuery || orderId).trim();
    if (!queryStr) return setError('Please enter your Order ID or Email Address');

    setLoading(true);
    setError('');
    
    setTimeout(async () => {
      try {
        const isEmailSearch = queryStr.includes('@');
        let foundOrders = [];
        let primaryOrder = null;

        if (isEmailSearch) {
          const searchEmail = queryStr.toLowerCase();
          
          // 1. Check Supabase by guest/customer email
          try {
            const { data, error: sbErr } = await supabase
              .from('orders')
              .select('*, order_items(*)')
              .ilike('customer_email', searchEmail)
              .order('created_at', { ascending: false });

            if (!sbErr && data && data.length > 0) {
              foundOrders = data;
            }
          } catch (e) {}

          // 2. Check localStorage by guest/customer email
          try {
            const allLocal = JSON.parse(localStorage.getItem('customer_orders') || '[]');
            const myLocal = allLocal.filter(o => o.customer_email && o.customer_email.trim().toLowerCase() === searchEmail);
            const existingIds = new Set(foundOrders.map(o => o.id));
            for (const lo of myLocal) {
              if (!existingIds.has(lo.id)) {
                foundOrders.push(lo);
              }
            }
          } catch (e) {}

          foundOrders = foundOrders.map(normalizeOrderItems);
          foundOrders.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));

          if (foundOrders.length > 0) {
            setCustomerOrders(foundOrders);
            primaryOrder = foundOrders[0];
            setOrderId(primaryOrder.id);
            buildTrackingView(primaryOrder);
          } else {
            setError(`No orders found associated with email "${queryStr}".`);
            setTrackingData(null);
          }
        } else {
          // Search by Order ID
          primaryOrder = customerOrders.find(o => o.id.toLowerCase() === queryStr.toLowerCase());

          if (!primaryOrder) {
            try {
              const { data, error: sbErr } = await supabase
                .from('orders')
                .select('*, order_items(*)')
                .eq('id', queryStr)
                .maybeSingle();

              if (!sbErr && data) {
                primaryOrder = normalizeOrderItems(data);
              }
            } catch (e) {}
          }

          if (!primaryOrder) {
            try {
              const allLocal = JSON.parse(localStorage.getItem('customer_orders') || '[]');
              const localMatch = allLocal.find(o => o.id.toLowerCase() === queryStr.toLowerCase());
              if (localMatch) {
                primaryOrder = normalizeOrderItems(localMatch);
              }
            } catch (e) {}
          }

          if (primaryOrder) {
            buildTrackingView(primaryOrder);
            if (!customerOrders.some(o => o.id === primaryOrder.id)) {
              setCustomerOrders([primaryOrder, ...customerOrders]);
            }
          } else {
            setError(`No order found matching "${queryStr}". Please check the ID or enter your checkout email.`);
            setTrackingData(null);
          }
        }
      } catch (err) {
        console.error('Tracking query error:', err);
        setError('Failed to fetch order details. Please try again.');
      } finally {
        setLoading(false);
      }
    }, 250);
  };

  const handleCancelOrder = async () => {
    if (!trackingData) return;

    // Check if within 10 minutes (600,000 ms)
    const orderCreatedAt = trackingData.created_at ? new Date(trackingData.created_at).getTime() : Date.now();
    const elapsedMs = Date.now() - orderCreatedAt;
    if (elapsedMs > 10 * 60 * 1000) {
      alert('Order cancellation is only allowed within 10 minutes of purchase. This order has already been locked for fulfillment.');
      return;
    }

    if (!window.confirm('Are you sure you want to cancel this order? Items will be restored to inventory.')) {
      return;
    }

    const targetId = trackingData.id;
    try {
      if (trackingData.items && trackingData.items.length > 0) {
        await restoreStockForCancelledOrder(trackingData.items);
      }

      // Update Supabase if connected
      try {
        await supabase
          .from('orders')
          .update({ status: 'cancelled' })
          .eq('id', targetId);
      } catch (e) {}

      // Update local storage
      const localSaved = JSON.parse(localStorage.getItem('customer_orders') || '[]');
      const updated = localSaved.map(o => o.id === targetId ? { ...o, status: 'cancelled' } : o);
      localStorage.setItem('customer_orders', JSON.stringify(updated));

      // Update local state
      setCustomerOrders(prev => prev.map(o => o.id === targetId ? { ...o, status: 'cancelled' } : o));

      buildTrackingView({ ...trackingData, status: 'cancelled' });
      alert('Order cancelled successfully.');
    } catch (err) {
      console.error('Cancellation error:', err);
    }
  };

  // ─── Header Information ───
  const customerEmail = customer?.email || '';
  const customerName = customer?.user_metadata?.full_name || customer?.name || (customerEmail ? customerEmail.split('@')[0] : 'Customer');

  // 10-minute cancellation calculation
  const orderCreatedAt = trackingData?.created_at ? new Date(trackingData.created_at).getTime() : null;
  const timeSinceOrderMs = orderCreatedAt ? (now - orderCreatedAt) : Infinity;
  const CANCELLATION_WINDOW_MS = 10 * 60 * 1000; // 10 minutes (600,000 ms)
  const remainingCancelMs = Math.max(0, CANCELLATION_WINDOW_MS - timeSinceOrderMs);
  const remainingCancelMins = Math.floor(remainingCancelMs / 60000);
  const remainingCancelSecs = Math.floor((remainingCancelMs % 60000) / 1000);
  const isWithin10Mins = remainingCancelMs > 0;
  const canCancelOrder = isWithin10Mins && 
                         trackingData && 
                         trackingData.status !== 'cancelled' && 
                         trackingData.status !== 'shipped' && 
                         trackingData.status !== 'delivered';

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-zinc-900 pb-24 font-sans">
      
      {/* Header */}
      <div className="bg-white border-b border-zinc-200 py-8 sm:py-12">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <nav className="flex items-center space-x-2 text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                <Link to="/" className="hover:text-zinc-900">Home</Link>
                <span>/</span>
                <span className="text-zinc-900">My Orders & Tracking</span>
              </nav>
              <h1 className="font-display text-2xl sm:text-4xl font-black uppercase tracking-tight text-zinc-900">
                Order Tracking
              </h1>
              {isLoggedIn ? (
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                    <CheckCircle className="h-3.5 w-3.5" />
                  </div>
                  <p className="text-xs text-zinc-500 font-medium">
                    Signed in as <span className="font-bold text-zinc-900">{customerEmail || customerName}</span>
                  </p>
                </div>
              ) : (
                <p className="text-xs text-zinc-500 font-medium mt-1">
                  Track purchases made as a Guest or registered customer via Email or Order ID.
                </p>
              )}
            </div>

            {!isLoggedIn && (
              <button
                onClick={() => openAuthModal({
                  mode: 'signin',
                  title: 'Sign In to View Orders',
                  subtitle: 'Access your order history and tracking',
                  redirectTo: '/tracking',
                })}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-full text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer self-start sm:self-auto shadow-xs"
              >
                <User className="h-4 w-4" />
                <span>Customer Sign In</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        
        {/* Search Box */}
        <div className="rounded-3xl bg-white border border-zinc-200 p-6 sm:p-8 shadow-xs">
          <label className="text-xs font-bold uppercase tracking-wider text-zinc-800 block mb-2">
            Track by Order ID or Checkout Email
          </label>
          <form 
            onSubmit={(e) => { e.preventDefault(); handleTrack(); }}
            className="flex flex-col sm:flex-row gap-3"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <input
                type="text"
                placeholder="e.g. SYNC-A1B2C3D4 or guest@example.com"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-10 pr-4 py-3 text-xs font-bold text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer shrink-0 disabled:opacity-50"
            >
              {loading ? 'Searching...' : 'Track Orders'}
            </button>
          </form>
          {error && (
            <p className="text-xs font-semibold text-red-500 mt-2 flex items-center gap-1">
              <AlertCircle className="h-3.5 w-3.5" /> {error}
            </p>
          )}
        </div>

        {/* ─── Customer's Order List ─── */}
        {ordersLoading ? (
          <div className="rounded-3xl bg-white border border-zinc-200 p-8 shadow-xs text-center">
            <div className="animate-pulse space-y-3">
              <div className="h-4 bg-zinc-100 rounded w-1/3 mx-auto"></div>
              <div className="h-3 bg-zinc-50 rounded w-1/2 mx-auto"></div>
            </div>
          </div>
        ) : customerOrders.length === 0 ? (
          <div className="rounded-3xl bg-white border border-zinc-200 p-8 sm:p-12 shadow-xs text-center space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-zinc-100 border border-zinc-200">
              <Package className="h-6 w-6 text-zinc-400" />
            </div>
            <h3 className="font-display text-base font-bold uppercase text-zinc-900">
              {isLoggedIn ? 'No Orders Found' : 'Track Your Ordered Products'}
            </h3>
            <p className="text-xs text-zinc-500 font-medium max-w-sm mx-auto">
              {isLoggedIn
                ? "You haven't placed any orders yet. Browse our premium screen protectors and place your first order!"
                : "Enter your checkout email address or Order ID in the search box above to view your ordered products, live dispatch status, and delivery milestones."}
            </p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-zinc-900 text-white rounded-full text-xs font-bold uppercase tracking-wider hover:bg-zinc-800 transition-colors"
            >
              Shop Now <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Your Order History ({customerOrders.length} order{customerOrders.length !== 1 ? 's' : ''})
            </h2>
            <div className="grid gap-4">
              {customerOrders.map((order) => {
                const statusColors = {
                  pending: 'bg-amber-100 text-amber-800 border-amber-200',
                  confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
                  processing: 'bg-indigo-100 text-indigo-800 border-indigo-200',
                  shipped: 'bg-sky-100 text-sky-800 border-sky-200',
                  delivered: 'bg-emerald-100 text-emerald-800 border-emerald-200',
                  cancelled: 'bg-red-100 text-red-800 border-red-200',
                };
                const statusColor = statusColors[order.status] || 'bg-zinc-100 text-zinc-800 border-zinc-200';
                const dateStr = new Date(order.created_at || Date.now()).toLocaleDateString('en-IN', {
                  day: 'numeric', month: 'short', year: 'numeric'
                });
                const isSelected = trackingData?.id === order.id;

                const oCreatedAt = order.created_at ? new Date(order.created_at).getTime() : 0;
                const oCanCancel = (now - oCreatedAt) < CANCELLATION_WINDOW_MS && order.status !== 'cancelled' && order.status !== 'shipped' && order.status !== 'delivered';

                return (
                  <motion.button
                    key={order.id}
                    onClick={() => { setOrderId(order.id); buildTrackingView(order); }}
                    className={`w-full text-left rounded-2xl border p-4 sm:p-5 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-zinc-900 text-white border-zinc-700 shadow-lg'
                        : 'bg-white border-zinc-200 hover:border-zinc-400 hover:shadow-sm'
                    }`}
                    whileTap={{ scale: 0.995 }}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`font-mono text-xs font-bold ${isSelected ? 'text-white' : 'text-zinc-900'}`}>
                            #{order.id.length > 12 ? order.id.substring(0, 12) + '...' : order.id}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                            isSelected ? 'bg-white/15 text-white border-white/20' : statusColor
                          }`}>
                            {order.status}
                          </span>
                          {oCanCancel && (
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                              isSelected ? 'bg-amber-400/20 text-amber-300 border-amber-400/30' : 'bg-amber-50 text-amber-700 border-amber-200'
                            }`}>
                              Cancelable (10m)
                            </span>
                          )}
                        </div>
                        <p className={`text-xs font-medium ${isSelected ? 'text-zinc-300' : 'text-zinc-500'}`}>
                          {dateStr} • {order.payment_type?.toUpperCase() || 'PREPAID'}
                          {order.items?.length ? ` • ${order.items.length} item${order.items.length > 1 ? 's' : ''}` : ''}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-sm font-bold ${isSelected ? 'text-white' : 'text-zinc-900'}`}>
                          ₹{order.total?.toLocaleString()}
                        </span>
                        <ChevronRight className={`h-4 w-4 ${isSelected ? 'text-zinc-400' : 'text-zinc-300'}`} />
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>
        )}

        {/* Tracking Details View */}
        {trackingData && (
          <div className="rounded-3xl bg-white border border-zinc-200 p-6 sm:p-10 shadow-xs space-y-8">
            
            {/* Status Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-200">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold text-zinc-400">Order ID:</span>
                  <span className="font-mono text-xs font-bold text-zinc-900 select-all">{trackingData.id}</span>
                </div>
                <h2 className="font-display text-xl sm:text-2xl font-black uppercase tracking-tight text-zinc-900">
                  Status: {trackingData.statusLabel}
                </h2>
              </div>

              <div className="flex items-center gap-3">
                {canCancelOrder ? (
                  <button
                    onClick={handleCancelOrder}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors cursor-pointer shadow-2xs"
                    title={`Cancel order within ${remainingCancelMins}m ${remainingCancelSecs}s`}
                  >
                    <Clock className="h-3.5 w-3.5 text-red-500 animate-pulse" />
                    <span>Cancel Order ({remainingCancelMins}m {remainingCancelSecs.toString().padStart(2, '0')}s left)</span>
                  </button>
                ) : trackingData.status !== 'cancelled' && trackingData.status !== 'delivered' ? (
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-zinc-400 bg-zinc-50 px-3 py-1.5 rounded-xl border border-zinc-200">
                    <ShieldCheck className="h-3.5 w-3.5 text-zinc-400" />
                    <span>Fulfillment In Progress</span>
                  </span>
                ) : null}
              </div>
            </div>

            {/* Milestones Progress Timeline */}
            {trackingData.status !== 'cancelled' && (
              <div className="py-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-6">
                  Shipment Milestones
                </h3>
                <div className="space-y-6 relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-zinc-200">
                  {trackingData.milestones?.map((step, idx) => (
                    <div key={idx} className="relative flex items-start gap-4">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 z-10 ${
                        step.completed
                          ? 'bg-zinc-900 text-white ring-4 ring-white shadow-xs'
                          : 'bg-zinc-100 text-zinc-400 border border-zinc-300 ring-4 ring-white'
                      }`}>
                        {step.completed ? <CheckCircle className="h-4 w-4" /> : idx + 1}
                      </div>
                      <div className="flex-1 min-w-0 pt-0.5">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className={`text-xs font-bold uppercase tracking-wider ${
                            step.completed ? 'text-zinc-900' : 'text-zinc-400'
                          }`}>
                            {step.label}
                          </h4>
                          <span className="text-[10px] text-zinc-400 font-semibold">{step.date}</span>
                        </div>
                        <p className="text-xs text-zinc-500 mt-0.5">{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Order Items & Shipping Address Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-zinc-200">
              
              {/* Shipping Address */}
              <div className="p-5 rounded-2xl bg-zinc-50 border border-zinc-200/80 space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-900 flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-zinc-600" />
                  <span>Delivery Destination</span>
                </h4>
                <p className="text-xs text-zinc-700 font-medium">
                  <strong>{trackingData.customer_name}</strong><br />
                  {trackingData.address}<br />
                  {trackingData.city}, {trackingData.state} - {trackingData.pincode}<br />
                  Phone: {trackingData.phone}
                </p>
              </div>

              {/* Summary */}
              <div className="p-5 rounded-2xl bg-zinc-50 border border-zinc-200/80 space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-900 flex items-center gap-1.5">
                  <Package className="h-3.5 w-3.5 text-zinc-600" />
                  <span>Payment & Total</span>
                </h4>
                <div className="text-xs text-zinc-700 space-y-1">
                  <p><strong>Payment Mode:</strong> {trackingData.payment_type?.toUpperCase() || 'PREPAID'}</p>
                  <p><strong>Total Paid:</strong> ₹{trackingData.total?.toLocaleString()}</p>
                  <p className="text-emerald-600 font-semibold">● 7-Day Free Replacement Guarantee Applies</p>
                </div>
              </div>

            </div>

            {/* Order Items Detail */}
            {trackingData.items && trackingData.items.length > 0 && (
              <div className="pt-6 border-t border-zinc-200">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-4">
                  Items in This Order
                </h4>
                <div className="space-y-3">
                  {trackingData.items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between gap-3 p-3 rounded-xl bg-zinc-50 border border-zinc-200/80">
                      <div className="flex items-center gap-3 min-w-0">
                        {item.image && (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-10 w-10 rounded-lg object-cover border border-zinc-200"
                          />
                        )}
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-zinc-900 truncate">{item.name || 'Screen Protector'}</p>
                          <p className="text-[10px] text-zinc-500 font-medium">
                            Qty: {item.quantity}{item.selectedModel ? ` • ${item.selectedModel}` : ''}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-zinc-900 shrink-0">
                        ₹{((item.price || 0) * (item.quantity || 1)).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
}