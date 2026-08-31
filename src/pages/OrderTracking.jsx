import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  Search, CheckCircle, Package, Clock, ShieldCheck, 
  ArrowLeft, ChevronRight, Truck, MapPin, AlertCircle, XCircle 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../supabaseClient';
import { restoreStockForCancelledOrder } from '../utils/stockManager';

export default function OrderTracking() {
  const [searchParams] = useSearchParams();
  const [orderId, setOrderId] = useState('');
  const [trackingData, setTrackingData] = useState(null);
  const [customerOrders, setCustomerOrders] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUserOrders();
    const urlOrderId = searchParams.get('orderId');
    if (urlOrderId) {
      setOrderId(urlOrderId);
      handleTrack(urlOrderId);
    }
  }, [searchParams]);

  const fetchUserOrders = async () => {
    try {
      const localSaved = JSON.parse(localStorage.getItem('customer_orders') || '[]');
      setCustomerOrders(localSaved);
      if (localSaved.length > 0 && !searchParams.get('orderId')) {
        setOrderId(localSaved[0].id);
        buildTrackingView(localSaved[0]);
      }
    } catch (e) {
      console.error('Error fetching customer orders:', e);
    }
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

    const statusInfo = statusMap[orderObj.status] || { label: orderObj.status, progress: 2 };
    const dateStr = new Date(orderObj.created_at || Date.now()).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric'
    });

    setTrackingData({
      ...orderObj,
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

  const handleTrack = async (targetId) => {
    const idToQuery = targetId || orderId;
    if (!idToQuery.trim()) return setError('Please enter a valid Order ID');

    setLoading(true);
    setError('');
    
    setTimeout(async () => {
      // 1. Check local storage
      const localSaved = JSON.parse(localStorage.getItem('customer_orders') || '[]');
      let found = localSaved.find(o => o.id === idToQuery.trim());

      // 2. If not found locally, check Supabase
      if (!found) {
        try {
          const { data, error } = await supabase
            .from('orders')
            .select('*, order_items(*)')
            .eq('id', idToQuery.trim())
            .single();
          if (!error && data) {
            found = data;
          }
        } catch (e) {}
      }

      if (found) {
        buildTrackingView(found);
      } else {
        setError('No order found with ID: ' + idToQuery);
      }
      setLoading(false);
    }, 400);
  };

  const handleCancelOrder = async () => {
    if (!trackingData) return;
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

      buildTrackingView({ ...trackingData, status: 'cancelled' });
      alert('Order cancelled successfully.');
    } catch (err) {
      console.error('Cancellation error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-zinc-900 pb-24 font-sans">
      
      {/* Header */}
      <div className="bg-white border-b border-zinc-200 py-8 sm:py-12">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center space-x-2 text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
            <Link to="/" className="hover:text-zinc-900">Home</Link>
            <span>/</span>
            <span className="text-zinc-900">Order Tracking</span>
          </nav>
          <h1 className="font-display text-2xl sm:text-4xl font-black uppercase tracking-tight text-zinc-900">
            Track Your Order
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 font-medium mt-1">
            Real-time status updates and shipping telemetry for your screen protectors.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        
        {/* Search Box */}
        <div className="rounded-3xl bg-white border border-zinc-200 p-6 sm:p-8 shadow-xs">
          <label className="text-xs font-bold uppercase tracking-wider text-zinc-800 block mb-2">
            Enter Order ID
          </label>
          <form 
            onSubmit={(e) => { e.preventDefault(); handleTrack(); }}
            className="flex flex-col sm:flex-row gap-3"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <input
                type="text"
                placeholder="e.g. SYNC-A1B2C3D4 or 36-char Order UUID"
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
              {loading ? 'Searching...' : 'Track Status'}
            </button>
          </form>
          {error && (
            <p className="text-xs font-semibold text-red-500 mt-2 flex items-center gap-1">
              <AlertCircle className="h-3.5 w-3.5" /> {error}
            </p>
          )}

          {/* Quick lookup from previous orders */}
          {customerOrders.length > 0 && (
            <div className="mt-5 pt-4 border-t border-zinc-100">
              <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-2">
                Recent Orders in this browser:
              </span>
              <div className="flex flex-wrap gap-2">
                {customerOrders.slice(0, 4).map((o) => (
                  <button
                    key={o.id}
                    onClick={() => { setOrderId(o.id); handleTrack(o.id); }}
                    className="px-3 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-xs font-semibold text-zinc-800 transition-colors cursor-pointer"
                  >
                    #{o.id.substring(0, 12)}... ({o.status})
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

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
                {trackingData.status !== 'cancelled' && trackingData.status !== 'delivered' && (
                  <button
                    onClick={handleCancelOrder}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors cursor-pointer"
                  >
                    Cancel Order
                  </button>
                )}
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

          </div>
        )}

      </div>
    </div>
  );
}